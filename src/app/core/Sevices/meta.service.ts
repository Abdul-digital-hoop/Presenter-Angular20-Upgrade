import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MetaService {

  constructor(
    private meta: Meta,
    private title: Title
  ) { }

  updateMetaTags(title: string, description: string, ogtitle: string, ogImage: string, ogdescription: string) {
    this.title.setTitle(title);

    this.meta.updateTag({ name: 'description', content: description });

    this.meta.updateTag({ property: 'og:title', content: ogtitle });
    this.meta.updateTag({ property: 'og:description', content: ogdescription });

    this.meta.updateTag({ name: 'twitter:title', content: ogtitle });
    this.meta.updateTag({ name: 'twitter:description', content: ogdescription });

  }

  getDefaultMeta() {
    return {
      title: 'Host Interactive Presentations Seamlessly | Slidea',
      description: 'Create engaging presentations with polls, quizzes, and Q&A. Slidea makes it easy for presenters to connect and interact with any audience in real-time.',
      ogImage: 'https://app.slidea.com/assets/images/Presenter.jpg',
      ogtitle: 'Present Smarter with Slidea’s Interactive Tools',
      ogdescription: 'From live polls to real-time Q&A, Slidea gives presenters the tools to engage, connect, and deliver impactful experiences whether remote or in-person.',
    };
  }

  getAuthPageMeta(page: 'signin' | 'signup' | 'forgetpassword' | 'verification' | 'resendemail' | 'changepassword') {
    const metaConfigs = {
      signin: {
        title: 'Log in to Slidea Now | Access Your Interactive Presentations',
        description: 'Continue where you left off! Sign in to your Slidea account now to create, manage, access your interactive presentations and analytics anytime.',
        ogImage: 'https://app.slidea.com/assets/images/Presenter.jpg',
        ogtitle: 'Sign In to Slidea – Your Interactive Presentation Hub',
        ogdescription: 'Access your interactive presentations, quizzes, polls, and more. Sign in to Slidea and pick up where you left off, quick, simple, and secure.'
      },
      signup: {
        title: 'Create Interactive Presentations | Join Slidea Now for Free',
        description: 'Sign up for Slidea today. Create and share interactive presentations with live polls, quizzes, and word clouds. Engage your audience effortlessly!',
        ogImage: 'https://app.slidea.com/assets/images/Presenter.jpg',
        ogtitle: 'Join Slidea – Create Interactive Presentations for Free',
        ogdescription: 'Sign up for Slidea to start building engaging presentations with live polls, quizzes, word clouds, and more. It’s free and takes just a minute.'
      },
      forgetpassword: {
        title: 'Forgot Password? Reset and Get Back to Slidea in Minutes',
        description: 'Forgot your Slidea password? Reset your password now to quickly regain access and continue where you left off with your interactive presentations.',
        ogImage: 'https://app.slidea.com/assets/images/Presenter.jpg',
        ogtitle: 'Reset Your Slidea Account Password Easily',
        ogdescription: 'Trouble signing in to your account? Reset your password and get back to creating interactive presentations with Slidea in just a few clicks.'
      },
      verification: {
        title: 'Verify Your Email Address and Login to Your Slidea Account',
        description: 'Complete your signup by verifying your email address. Get started and create your interactive, idea-driven presentations on Slidea today.',
        ogImage: 'https://app.slidea.com/assets/images/Presenter.jpg',
        ogtitle: 'Verify Your Email Address to Start Using Slidea',
        ogdescription: 'Confirm your email address to verify your Slidea account and unlock powerful tools for creating interactive presentations with Slidea.'
      },
      resendemail: {
        title: 'Resending Your Slidea Verification Email',
        description: 'Didn\'t get the verification email? Easily resend it to activate your Slidea account and start creating interactive presentations in no time.',
        ogImage: 'https://app.slidea.com/assets/images/Presenter.jpg',
        ogtitle: 'Resending Email Verification for Slidea Account Activation',
        ogdescription: 'Verify your email to access all features. Resending your Slidea account verification email and start presenting with polls, quizzes, and more.'
      },
      changepassword: {
        title: 'Change Your Password Securely | Slidea',
        description: 'Update your Slidea account password quickly and securely, and keep your files and interactive presentation experience safe and protected.',
        ogImage: 'https://app.slidea.com/assets/images/Presenter.jpg',
        ogtitle: 'Change Your Slidea Password Safely and Securely',
        ogdescription: 'Secure your account by updating your password. Change your Slidea password anytime to stay safe while creating interactive presentations.'
      }
    };

    return metaConfigs[page];
  }

  resetToDefault() {
    const defaultMeta = this.getDefaultMeta();
    this.updateMetaTags(defaultMeta.title, defaultMeta.description, defaultMeta.ogtitle, defaultMeta.ogImage, defaultMeta.ogdescription);
  }
} 