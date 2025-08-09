#!/usr/bin/env tsx

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { readFileSync, writeFileSync } from 'fs';

/**
 * Security Manager for handling sensitive information
 */

class SecurityManager {
  /**
   * Generate a bcrypt hash for a password
   */
  static hashPassword(password: string): string {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    return bcrypt.hashSync(password, saltRounds);
  }

  /**
   * Generate a secure random string
   */
  static generateSecureSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate NextAuth compatible secret
   */
  static generateNextAuthSecret(): string {
    return this.generateSecureSecret(32);
  }

  /**
   * Generate session secret
   */
  static generateSessionSecret(): string {
    return this.generateSecureSecret(64);
  }

  /**
   * Generate CSRF secret
   */
  static generateCsrfSecret(): string {
    return this.generateSecureSecret(32);
  }

  /**
   * Update .env file with new secure values
   */
  static updateEnvFile(): void {
    const envPath = '.env';
    let envContent = readFileSync(envPath, 'utf8');

    // Generate new secrets
    const nextAuthSecret = this.generateNextAuthSecret();
    const sessionSecret = this.generateSessionSecret();
    const csrfSecret = this.generateCsrfSecret();

    // Replace secrets in env file
    envContent = envContent.replace(
      /NEXTAUTH_SECRET=.*/g,
      `NEXTAUTH_SECRET=${nextAuthSecret}`
    );
    envContent = envContent.replace(
      /SESSION_SECRET=.*/g,
      `SESSION_SECRET=${sessionSecret}`
    );
    envContent = envContent.replace(
      /CSRF_SECRET=.*/g,
      `CSRF_SECRET=${csrfSecret}`
    );

    writeFileSync(envPath, envContent);
    console.log('✅ Environment file updated with new secure secrets');
  }

  /**
   * Hash a password and show the result
   */
  static hashPasswordCLI(password: string): void {
    const hash = this.hashPassword(password);
    console.log(`Password: ${password}`);
    console.log(`BCrypt Hash: ${hash}`);
    console.log(`Add this to your .env file: ADMIN_PASSWORD=${hash}`);
  }

  /**
   * Verify a password against a hash
   */
  static verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  switch (args[0]) {
    case 'hash':
      if (!args[1]) {
        console.error('Please provide a password to hash');
        process.exit(1);
      }
      SecurityManager.hashPasswordCLI(args[1]);
      break;
    
    case 'verify':
      if (!args[2]) {
        console.error('Please provide password and hash to verify');
        process.exit(1);
      }
      const isValid = SecurityManager.verifyPassword(args[1], args[2]);
      console.log(`Password ${isValid ? 'matches' : 'does not match'} the hash`);
      break;
    
    case 'update-secrets':
      SecurityManager.updateEnvFile();
      break;
    
    case 'generate':
      console.log('NextAuth Secret:', SecurityManager.generateNextAuthSecret());
      console.log('Session Secret:', SecurityManager.generateSessionSecret());
      console.log('CSRF Secret:', SecurityManager.generateCsrfSecret());
      break;
    
    default:
      console.log(`
Security Manager CLI

Usage:
  npm run security hash <password>     - Hash a password
  npm run security verify <password> <hash> - Verify password against hash
  npm run security update-secrets      - Update .env with new secure secrets
  npm run security generate           - Generate new secrets
      `);
  }
}

export default SecurityManager;