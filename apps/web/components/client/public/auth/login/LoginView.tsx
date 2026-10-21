'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { GoogleSignInButton } from '@/components/client/public/auth/GoogleSignInButton';
import { RoleSelectionModal } from '@/components/custom-ui/modals/RoleSelectionModal';
import { AuthBanner } from '@/components/client/public/auth/AuthBanner';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SplashScreen } from '@/components/ui/SplashScreen';
import { toast } from 'sonner';

export const LoginView: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoading, login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State untuk modal pemilihan peran bagi user baru via Google
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  }>({});

  // Jika sudah terautentikasi, langsung arahkan ke dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (user) {
    return <SplashScreen message={t('splash.redirecting')} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      toast.success(t('auth.loginSuccess'));
    } catch (err: any) {
      const msg = err.message || t('auth.loginFailed');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await loginWithGoogle(idToken);
      if (res.isNewUser) {
        setPendingGoogleToken(idToken);
        setPendingGoogleUser({
          email: res.email,
          fullName: res.fullName,
          avatarUrl: res.avatarUrl,
        });
        setShowRoleModal(true);
      } else {
        toast.success(t('auth.googleLoginSuccess'));
      }
    } catch (err: any) {
      const msg = err.message || t('auth.googleLoginFailed');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = async (role: 'OWNER' | 'TENANT' | 'USER') => {
    if (!pendingGoogleToken) return;
    await loginWithGoogle(pendingGoogleToken, role);
    setShowRoleModal(false);
  };

  return (
    <div className="flex min-h-screen bg-background dark:bg-background">
      {/* Left Form Area */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <div />
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md animate-fade-in my-auto py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 via-rose-500 to-rose- text-white font-black text-3xl shadow-xl shadow-rose-500/25 border border-white/20 dark:border-white/10 mb-6">
              R
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground">
              {t('auth.loginTitle')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-muted-foreground mt-2">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          <Card className="rounded-3xl border-slate-200/80 dark:border-border/80 bg-white/90 dark:bg-card/70 backdrop-blur-xl shadow-2xl shadow-slate-200/50 dark:shadow-black/40 animate-slide-up">
            <CardContent className="p-8">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-start gap-3 text-rose-700 dark:text-rose-400 text-xs leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Tombol Google Sign-In */}
              <div className="mb-6">
                <GoogleSignInButton
                  text={t('auth.googleLogin')}
                  disabled={loading}
                  onSuccess={handleGoogleSuccess}
                  onError={(err) => setError(err)}
                />

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-card px-3 text-slate-400 dark:text-muted-foreground font-medium">
                      {t('auth.orWithEmail')}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                    {t('auth.emailLabel')}
                  </label>
                  <div className="relative shadow-sm rounded-xl">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 z-10 pointer-events-none" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                    {t('auth.passwordLabel')}
                  </label>
                  <div className="relative shadow-sm rounded-xl">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 z-10 pointer-events-none" />
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 h-12 rounded-xl font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 hover:shadow-rose-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t('auth.loginButton')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-border text-center">
                <p className="text-sm text-gray-500 dark:text-muted-foreground">
                  {t('auth.noAccount')}
                  <Link
                    href="/register"
                    className="font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:underline transition-colors"
                  >
                    {t('auth.registerLink')}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Hero Area */}
      <AuthBanner />

      {/* Role Selection Modal untuk user baru Google */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSelectRole={handleSelectRole}
        email={pendingGoogleUser.email}
        fullName={pendingGoogleUser.fullName}
        avatarUrl={pendingGoogleUser.avatarUrl}
      />
    </div>
  );
};
