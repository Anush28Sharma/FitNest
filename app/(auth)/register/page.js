'use client';

import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Input from '@/components/common/Input';
import AuthLayout from '@/components/layouts/AuthLayout';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Badge from '@/components/common/Badge';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    // Frontend validation
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      
      // Refresh to ensure the cookie is recognized by middleware
      router.refresh();
      
      // Small delay to ensure cookie propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the elite health ecosystem and start tracking with AI precision today."
    >
      <div className="space-y-6 animate-fadeIn">
        <div className="space-y-1.5 text-center md:text-left">
          <h1 className="text-3xl font-display text-[var(--foreground)]">
            Get <span className="gradient-text">Started</span>
          </h1>
          <p className="text-[var(--muted-foreground)] font-medium text-xs">
            Quick 1-minute setup to unlock your health future.
          </p>
        </div>

        <ErrorMessage message={error} className="mb-4" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="register-username"
              name="username"
              type="text"
              label="Username"
              placeholder="unique_id"
              value={formData.username}
              onChange={handleChange}
              error={fieldErrors.username}
              required
              minLength={3}
            />

            <Input
              id="register-name"
              name="name"
              type="text"
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              error={fieldErrors.name}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="register-mobile"
              name="mobile"
              type="tel"
              label="Mobile"
              placeholder="Phone number"
              value={formData.mobile}
              onChange={handleChange}
              error={fieldErrors.mobile}
              required
            />

            <Input
              id="register-email"
              name="email"
              type="email"
              label="Email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              error={fieldErrors.email}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="register-password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={fieldErrors.password}
              required
              minLength={6}
            />

            <Input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              label="Confirm"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={fieldErrors.confirmPassword}
              required
              minLength={6}
            />
          </div>

          <Button
            id="register-submit"
            type="submit"
            loading={loading}
            className="w-full h-12 text-sm font-bold shadow-accent"
          >
            Create Account
          </Button>
        </form>

        <p className="text-[13px] text-center text-[var(--muted-foreground)]">
          Already a member?{' '}
          <Link id="link-to-login" href="/login" className="text-[var(--accent)] font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
