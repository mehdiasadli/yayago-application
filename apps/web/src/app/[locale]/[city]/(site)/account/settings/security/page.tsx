'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Shield,
  Key,
  Smartphone,
  Globe,
  Clock,
  Loader2,
  LogOut,
  CheckCircle,
  Monitor,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function SecuritySettingsPage() {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRevokingSession, setIsRevokingSession] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch sessions using Better Auth
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const result = await authClient.listSessions();
      return result.data ?? [];
    },
  });

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (result.error) {
        toast.error(result.error.message || 'Failed to change password');
      } else {
        toast.success('Password changed successfully');
        setChangePasswordOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionToken: string) => {
    setIsRevokingSession(sessionToken);
    try {
      const result = await authClient.revokeSession({ token: sessionToken });
      if (result.error) {
        toast.error(result.error.message || 'Failed to revoke session');
      } else {
        toast.success('Session revoked successfully');
        refetchSessions();
      }
    } catch {
      toast.error('Failed to revoke session');
    } finally {
      setIsRevokingSession(null);
    }
  };

  const handleRevokeAllSessions = async () => {
    setIsRevokingAll(true);
    try {
      const result = await authClient.revokeSessions();
      if (result.error) {
        toast.error(result.error.message || 'Failed to revoke sessions');
      } else {
        toast.success('All other sessions revoked');
        refetchSessions();
      }
    } catch {
      toast.error('Failed to revoke sessions');
    } finally {
      setIsRevokingAll(false);
    }
  };

  const parseUserAgent = (userAgent: string | null) => {
    if (!userAgent) return { browser: 'Unknown', device: 'Unknown' };

    const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/)?.[0] || 'Unknown';
    const isMobile = /Mobile|Android|iPhone/.test(userAgent);
    const device = isMobile ? 'Mobile' : 'Desktop';

    return { browser, device };
  };

  // Get current session token for comparison
  const currentSessionToken =
    typeof window !== 'undefined'
      ? document.cookie.match(/better-auth\.session[^=]*=([^;]*)/)?.[1]
      : null;

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-destructive' };
    if (strength <= 3) return { strength, label: 'Fair', color: 'bg-amber-500' };
    if (strength <= 4) return { strength, label: 'Good', color: 'bg-emerald-500' };
    return { strength, label: 'Strong', color: 'bg-emerald-600' };
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsDontMatch = newPassword && confirmPassword && newPassword !== confirmPassword;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10'>
          <Shield className='size-6 text-primary' />
        </div>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Security</h2>
          <p className='text-muted-foreground'>Manage your password and active sessions</p>
        </div>
      </div>

      {/* Password Section */}
      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
              <Key className='size-4 text-muted-foreground' />
            </div>
            <div>
              <CardTitle className='text-base'>Password</CardTitle>
              <CardDescription className='text-sm'>
                Change your password to keep your account secure
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between rounded-xl bg-muted/50 p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-lg bg-background'>
                <Lock className='size-5 text-muted-foreground' />
              </div>
              <div>
                <p className='font-medium'>Password</p>
                <p className='text-sm text-muted-foreground'>Last changed: Unknown</p>
              </div>
            </div>
            <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' className='h-9'>
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className='rounded-2xl sm:max-w-md'>
                <DialogHeader className='text-left'>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10'>
                      <Key className='size-5 text-primary' />
                    </div>
                    <div>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription className='text-sm'>
                        Enter your current password and choose a new one
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className='space-y-4 py-2'>
                  {/* Current Password */}
                  <div className='space-y-2'>
                    <Label htmlFor='currentPassword'>Current Password</Label>
                    <div className='relative'>
                      <Input
                        id='currentPassword'
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className='h-11 pr-10'
                        placeholder='Enter current password'
                      />
                      <button
                        type='button'
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                      >
                        {showCurrentPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className='space-y-2'>
                    <Label htmlFor='newPassword'>New Password</Label>
                    <div className='relative'>
                      <Input
                        id='newPassword'
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className='h-11 pr-10'
                        placeholder='Enter new password'
                      />
                      <button
                        type='button'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                      >
                        {showNewPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
                      </button>
                    </div>
                    {/* Password Strength */}
                    {newPassword && (
                      <div className='space-y-1.5'>
                        <div className='flex gap-1'>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={cn(
                                'h-1 flex-1 rounded-full transition-colors',
                                i <= passwordStrength.strength ? passwordStrength.color : 'bg-muted'
                              )}
                            />
                          ))}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          Password strength: <span className='font-medium'>{passwordStrength.label}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                    <div className='relative'>
                      <Input
                        id='confirmPassword'
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={cn(
                          'h-11 pr-10',
                          passwordsMatch && 'border-emerald-500 focus-visible:ring-emerald-500/50',
                          passwordsDontMatch && 'border-destructive focus-visible:ring-destructive/50'
                        )}
                        placeholder='Confirm new password'
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                      >
                        {showConfirmPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
                      </button>
                    </div>
                    {passwordsMatch && (
                      <p className='text-xs text-emerald-600 flex items-center gap-1'>
                        <CheckCircle2 className='size-3' />
                        Passwords match
                      </p>
                    )}
                    {passwordsDontMatch && (
                      <p className='text-xs text-destructive flex items-center gap-1'>
                        <AlertTriangle className='size-3' />
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>

                <div className='flex gap-3 pt-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setChangePasswordOpen(false)}
                    className='flex-1 h-11'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !currentPassword || !newPassword || !passwordsMatch}
                    className='flex-1 h-11'
                  >
                    {isChangingPassword && <Loader2 className='size-4 mr-2 animate-spin' />}
                    Change Password
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                <Monitor className='size-4 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-base'>Active Sessions</CardTitle>
                <CardDescription className='text-sm'>
                  Devices where you're currently signed in
                </CardDescription>
              </div>
            </div>
            {sessionsData && sessionsData.length > 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-destructive hover:text-destructive h-9'
                    disabled={isRevokingAll}
                  >
                    {isRevokingAll ? (
                      <Loader2 className='size-4 mr-2 animate-spin' />
                    ) : (
                      <LogOut className='size-4 mr-2' />
                    )}
                    Sign Out All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className='rounded-2xl'>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign out of all devices?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will sign you out of all devices except the current one. You'll need to sign in
                      again on those devices.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className='h-10'>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRevokeAllSessions}
                      className='h-10 bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                      Sign Out All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className='space-y-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='flex items-center gap-4 rounded-xl border p-4'>
                  <Skeleton className='size-10 rounded-lg' />
                  <div className='flex-1 space-y-1.5'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-3 w-48' />
                  </div>
                </div>
              ))}
            </div>
          ) : sessionsData && sessionsData.length > 0 ? (
            <div className='space-y-3'>
              {sessionsData.map((session) => {
                const { browser, device } = parseUserAgent(session.userAgent ?? null);
                const isCurrent = session.token === currentSessionToken;

                return (
                  <div
                    key={session.id}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-4 transition-colors',
                      isCurrent && 'bg-primary/5 border-primary/20'
                    )}
                  >
                    <div className='flex items-center gap-4'>
                      <div
                        className={cn(
                          'flex size-10 items-center justify-center rounded-lg',
                          isCurrent ? 'bg-primary/10' : 'bg-muted'
                        )}
                      >
                        {device === 'Mobile' ? (
                          <Smartphone className={cn('size-5', isCurrent ? 'text-primary' : 'text-muted-foreground')} />
                        ) : (
                          <Monitor className={cn('size-5', isCurrent ? 'text-primary' : 'text-muted-foreground')} />
                        )}
                      </div>
                      <div>
                        <div className='flex items-center gap-2'>
                          <p className='font-medium'>
                            {browser} on {device}
                          </p>
                          {isCurrent && (
                            <Badge className='gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-xs'>
                              <CheckCircle className='size-3' />
                              This device
                            </Badge>
                          )}
                        </div>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground mt-0.5'>
                          {session.ipAddress && (
                            <>
                              <Globe className='size-3' />
                              <span>{session.ipAddress}</span>
                              <span className='text-muted-foreground/50'>•</span>
                            </>
                          )}
                          <Clock className='size-3' />
                          <span>{formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    {!isCurrent && (
                      <Button
                        variant='ghost'
                        size='icon'
                        className='size-9 text-destructive hover:text-destructive hover:bg-destructive/10'
                        onClick={() => handleRevokeSession(session.token)}
                        disabled={isRevokingSession === session.token}
                      >
                        {isRevokingSession === session.token ? (
                          <Loader2 className='size-4 animate-spin' />
                        ) : (
                          <LogOut className='size-4' />
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='text-center py-8'>
              <Monitor className='size-10 text-muted-foreground/30 mx-auto mb-3' />
              <p className='text-muted-foreground'>No active sessions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className='rounded-2xl border-amber-500/30 bg-amber-500/5'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-xl bg-amber-500/10'>
              <Shield className='size-4 text-amber-600' />
            </div>
            <CardTitle className='text-base text-amber-700 dark:text-amber-400'>Security Tips</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className='space-y-3'>
            <li className='flex items-start gap-3'>
              <div className='flex size-6 items-center justify-center rounded-full bg-emerald-500/10 shrink-0 mt-0.5'>
                <CheckCircle className='size-3.5 text-emerald-500' />
              </div>
              <p className='text-sm text-muted-foreground'>
                Use a strong, unique password that you don't use elsewhere
              </p>
            </li>
            <li className='flex items-start gap-3'>
              <div className='flex size-6 items-center justify-center rounded-full bg-emerald-500/10 shrink-0 mt-0.5'>
                <CheckCircle className='size-3.5 text-emerald-500' />
              </div>
              <p className='text-sm text-muted-foreground'>
                Review your active sessions regularly and sign out from unfamiliar devices
              </p>
            </li>
            <li className='flex items-start gap-3'>
              <div className='flex size-6 items-center justify-center rounded-full bg-emerald-500/10 shrink-0 mt-0.5'>
                <CheckCircle className='size-3.5 text-emerald-500' />
              </div>
              <p className='text-sm text-muted-foreground'>
                Keep your email address up to date for account recovery
              </p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
