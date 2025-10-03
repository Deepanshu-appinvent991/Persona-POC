import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send approval email
export const sendApprovalEmail = async (
  email: string,
  entityName: string,
  approvalNotes?: string
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Persona System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Entity Application Approved ✅',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
          <h1>🎉 Congratulations!</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Your Application Has Been Approved</h2>
          
          <p>Dear <strong>${entityName}</strong>,</p>
          
          <p>We are pleased to inform you that your entity application has been <strong>approved</strong>.</p>
          
          ${approvalNotes ? `
            <div style="background-color: #e8f5e8; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
              <h3>Approval Notes:</h3>
              <p>${approvalNotes}</p>
            </div>
          ` : ''}
          
          <p>You can now proceed with the next steps in your application process.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666;">Thank you for choosing Persona System</p>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; 2024 Persona System. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};

// Send rejection email
export const sendRejectionEmail = async (
  email: string,
  entityName: string,
  rejectionReason: string
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Persona System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Entity Application Status Update ❌',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f44336; color: white; padding: 20px; text-align: center;">
          <h1>Application Status Update</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Application Status</h2>
          
          <p>Dear <strong>${entityName}</strong>,</p>
          
          <p>We regret to inform you that your entity application has been <strong>rejected</strong>.</p>
          
          <div style="background-color: #ffeaea; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0;">
            <h3>Reason for Rejection:</h3>
            <p>${rejectionReason}</p>
          </div>
          
          <p>If you believe this decision was made in error or if you have additional information to provide, please feel free to contact our support team.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666;">Thank you for your interest in Persona System</p>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; 2024 Persona System. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw error;
  }
};

// Send welcome email for new registrations
export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Persona System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Persona System! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center;">
          <h1>Welcome to Persona System!</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Welcome Aboard!</h2>
          
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>Welcome to the Persona System! Your account has been successfully created.</p>
          
          <p>You can now:</p>
          <ul>
            <li>Submit entity applications</li>
            <li>Track application status</li>
            <li>Upload supporting documents</li>
            <li>Receive real-time updates</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666;">Get started by logging into your account</p>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; 2024 Persona System. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Test email configuration
export const testEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};
