// Environment configuration for frontend
export type Environment = 'sandbox' | 'production';

export interface EnvironmentConfig {
  environment: Environment;
  backendApiUrl: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  vercelUrl: string;
  ibgeApiUrl: string;
}

class ConfigManager {
  private config: EnvironmentConfig;

  constructor() {
    const environment = (process.env.NEXT_PUBLIC_ENVIRONMENT || 'sandbox') as Environment;
    
    this.config = {
      environment,
      backendApiUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL || '',
      firebase: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
      },
      vercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL || '',
      ibgeApiUrl: process.env.IBGE_API_URL || 'https://servicodados.ibge.gov.br/api/v1',
    };

    this.validateConfig();
  }

  private validateConfig(): void {
    const requiredFields = [
      'backendApiUrl',
      'firebase.apiKey',
      'firebase.authDomain',
      'firebase.projectId',
      'firebase.storageBucket',
      'firebase.messagingSenderId',
      'firebase.appId',
    ];

    for (const field of requiredFields) {
      const value = this.getNestedValue(this.config, field);
      if (!value) {
        console.warn(`Missing required environment variable for: ${field}`);
      }
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  public getConfig(): EnvironmentConfig {
    return this.config;
  }

  public isProduction(): boolean {
    return this.config.environment === 'production';
  }

  public isSandbox(): boolean {
    return this.config.environment === 'sandbox';
  }

  public getBackendUrl(): string {
    return this.config.backendApiUrl;
  }

  public getFirebaseConfig() {
    return this.config.firebase;
  }
}

// Export singleton instance
export const envConfig = new ConfigManager();
