import Bootstrap from './bootstrap';

async function main() {
  console.log('🎯 Persona POC - Starting All Services');
  console.log('=====================================\n');

  const bootstrap = new Bootstrap();
  await bootstrap.start();
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

main().catch((error) => {
  console.error('💥 Application failed to start:', error);
  process.exit(1);
});
