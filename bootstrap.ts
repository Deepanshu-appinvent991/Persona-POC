import spawn from 'cross-spawn';
import { ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

interface Service {
  name: string;
  command: string;
  args: string[];
  cwd?: string;
  color: string;
}

class Bootstrap {
  private services: Map<string, ChildProcess> = new Map();
  private isShuttingDown = false;

  private readonly serviceConfigs: Service[] = [
    {
      name: 'MongoDB',
      command: 'mongod',
      args: ['--dbpath', path.join(process.cwd(), '..', 'data', 'db')],
      color: '\x1b[32m', // Green
    },
    {
      name: 'Redis',
      command: 'redis-server',
      args: [],
      color: '\x1b[31m', // Red
    },
    {
      name: 'Backend',
      command: 'npm',
      args: ['run', 'dev'],
      cwd: process.cwd(), // Now running from persona-poc directory
      color: '\x1b[34m', // Blue
    },
    // {
    //   name: 'Frontend',
    //   command: 'npm',
    //   args: ['start'],
    //   cwd: path.join(process.cwd(), '..', 'persona-poc-frontend'),
    //   color: '\x1b[35m', // Magenta
    // },
  ];

  constructor() {
    this.setupGracefulShutdown();
    this.ensureDataDirectories();
  }

  private ensureDataDirectories(): void {
    const dataDir = path.join(process.cwd(), '..', 'data', 'db');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Created MongoDB data directory');
    }
  }

  private log(serviceName: string, message: string, color: string): void {
    const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[${timestamp}] [${serviceName}]\x1b[0m ${message}`);
  }

  private async checkDependencies(): Promise<boolean> {
    const checks = [
      { name: 'Node.js', command: 'node', args: ['--version'] },
      { name: 'MongoDB', command: 'mongod', args: ['--version'] },
      { name: 'Redis', command: 'redis-server', args: ['--version'] },
    ];

    console.log('🔍 Checking dependencies...\n');

    for (const check of checks) {
      try {
        await new Promise<void>((resolve, reject) => {
          const proc = spawn(check.command, check.args, { stdio: 'pipe' });
          
          proc.on('error', () => reject());
          proc.on('close', (code) => {
            if (code === 0 || check.name === 'MongoDB' || check.name === 'Redis') {
              console.log(`✅ ${check.name} is available`);
              resolve();
            } else {
              reject();
            }
          });

          // Timeout after 3 seconds
          setTimeout(() => {
            proc.kill();
            reject();
          }, 3000);
        });
      } catch {
        console.log(`❌ ${check.name} is not available or not in PATH`);
        return false;
      }
    }

    console.log('');
    return true;
  }

  private async installDependencies(): Promise<void> {
    const projects = [
      { name: 'Backend', path: '.' }, // Current directory (persona-poc)
      // { name: 'Frontend', path: '../persona-poc-frontend' },
    ];

    for (const project of projects) {
      const projectPath = path.resolve(process.cwd(), project.path);
      const packageJsonPath = path.join(projectPath, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        const nodeModulesPath = path.join(projectPath, 'node_modules');
        
        if (!fs.existsSync(nodeModulesPath)) {
          console.log(`📦 Installing ${project.name} dependencies...`);
          
          await new Promise<void>((resolve, reject) => {
            const proc = spawn('npm', ['install'], {
              cwd: projectPath,
              stdio: 'pipe',
            });

            proc.stdout?.on('data', (data) => {
              process.stdout.write(`\x1b[36m[${project.name} Install]\x1b[0m ${data}`);
            });

            proc.on('close', (code) => {
              if (code === 0) {
                console.log(`✅ ${project.name} dependencies installed\n`);
                resolve();
              } else {
                console.log(`❌ Failed to install ${project.name} dependencies\n`);
                reject();
              }
            });
          });
        } else {
          console.log(`✅ ${project.name} dependencies already installed`);
        }
      }
    }
  }

  private async startService(config: Service): Promise<void> {
    return new Promise((resolve) => {
      const proc = spawn(config.command, config.args, {
        cwd: config.cwd || process.cwd(),
        stdio: 'pipe',
      });

      this.services.set(config.name, proc);

      proc.stdout?.on('data', (data) => {
        const message = data.toString().trim();
        if (message) {
          this.log(config.name, message, config.color);
        }
      });

      proc.stderr?.on('data', (data) => {
        const message = data.toString().trim();
        if (message && !message.includes('DeprecationWarning')) {
          this.log(config.name, `ERROR: ${message}`, '\x1b[31m');
        }
      });

      proc.on('close', (code) => {
        if (!this.isShuttingDown) {
          this.log(config.name, `Process exited with code ${code}`, '\x1b[33m');
        }
        this.services.delete(config.name);
      });

      proc.on('error', (error) => {
        this.log(config.name, `Failed to start: ${error.message}`, '\x1b[31m');
      });

      // Give service time to start
      setTimeout(() => {
        this.log(config.name, 'Started', config.color);
        resolve();
      }, config.name === 'Frontend' ? 5000 : 2000);
    });
  }

  private setupGracefulShutdown(): void {
    const shutdown = () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;

      console.log('\n🛑 Shutting down services...');

      this.services.forEach((proc, name) => {
        console.log(`   Stopping ${name}...`);
        proc.kill('SIGTERM');
      });

      setTimeout(() => {
        this.services.forEach((proc) => {
          proc.kill('SIGKILL');
        });
        process.exit(0);
      }, 5000);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('SIGQUIT', shutdown);
  }

  public async start(): Promise<void> {
    console.log('🚀 Persona POC Bootstrap Starting...\n');

    // Check dependencies
    const depsOk = await this.checkDependencies();
    if (!depsOk) {
      console.log('❌ Please install missing dependencies and try again.');
      process.exit(1);
    }

    // Install project dependencies
    await this.installDependencies();

    // Start services in order
    console.log('🔄 Starting services...\n');

    for (const serviceConfig of this.serviceConfigs) {
      try {
        await this.startService(serviceConfig);
      } catch (error) {
        console.log(`❌ Failed to start ${serviceConfig.name}`);
        process.exit(1);
      }
    }

    console.log('\n🎉 All services started successfully!');
    console.log('\n📋 Access URLs:');
    // console.log('   Frontend:     http://localhost:3001');
    console.log('   Backend API:  http://localhost:3000');
    console.log('   API Docs:     http://localhost:3000/api-docs');
    console.log('   Health Check: http://localhost:3000/health');
    console.log('\n💡 Press Ctrl+C to stop all services\n');

    // Keep the process alive
    process.stdin.resume();
  }
}

// Run bootstrap if this file is executed directly
if (require.main === module) {
  const bootstrap = new Bootstrap();
  bootstrap.start().catch((error) => {
    console.error('❌ Bootstrap failed:', error);
    process.exit(1);
  });
}

export default Bootstrap;
