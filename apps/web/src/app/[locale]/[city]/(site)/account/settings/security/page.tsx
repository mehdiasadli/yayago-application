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
  DialogFooter,
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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function SecuritySettingsPage() {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRevokingSession, setIsRevokingSession] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  // Fetch sessions using Better Auth
  const { data: sessionsData, isLoading: sessionsLoading, refetch: refetchSessions } = useQuery({
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
  const currentSessionToken = typeof window !== 'undefined' 
    ? document.cookie.match(/better-auth\.session[^=]*=([^;]*)/)?.[1] 
    : null;

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Security</h2>
        <p className='text-muted-foreground'>Manage your password and active sessions</p>
      </div>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Key className='size-5' />
            Password
          </CardTitle>
          <CardDescription>Change your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
            <DialogTrigger asChild>
              <Button variant='outline'>Change Password</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and choose a new one
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='currentPassword'>Current Password</Label>
                  <Input
                    id='currentPassword'
                    type='password'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='newPassword'>New Password</Label>
                  <Input
                    id='newPassword'
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setChangePasswordOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                  {isChangingPassword && <Loader2 className='size-4 mr-2 animate-spin' />}
                  Change Password
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Monitor className='size-5' />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Devices where you're currently signed in
              </CardDescription>
            </div>
            {sessionsData && sessionsData.length > 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='outline' size='sm' className='text-destructive' disabled={isRevokingAll}>
                    {isRevokingAll ? (
                      <Loader2 className='size-4 mr-2 animate-spin' />
                    ) : (
                      <LogOut className='size-4 mr-2' />
                    )}
                    Sign Out All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign out of all devices?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will sign you out of all devices except the current one. You'll need to
                      sign in again on those devices.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRevokeAllSessions}
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
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
            <div className='space-y-4'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='flex items-center gap-4'>
                  <Skeleton className='size-10 rounded-lg' />
                  <div className='flex-1'>
                    <Skeleton className='h-4 w-32 mb-1' />
                    <Skeleton className='h-3 w-48' />
                  </div>
                </div>
              ))}
            </div>
          ) : sessionsData && sessionsData.length > 0 ? (
            <div className='space-y-4'>
              {sessionsData.map((session) => {
                const { browser, device } = parseUserAgent(session.userAgent ?? null);
                const isCurrent = session.token === currentSessionToken;

                return (
                  <div
                    key={session.id}
                    className='flex items-center justify-between p-3 rounded-lg border'
                  >
                    <div className='flex items-center gap-4'>
                      <div className='p-2 rounded-lg bg-muted'>
                        {device === 'Mobile' ? (
                          <Smartphone className='size-5' />
                        ) : (
                          <Monitor className='size-5' />
                        )}
                      </div>
                      <div>
                        <div className='flex items-center gap-2'>
                          <p className='font-medium'>
                            {browser} on {device}
                          </p>
                          {isCurrent && (
                            <Badge variant='secondary' className='text-xs'>
                              <CheckCircle className='size-3 mr-1' />
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          {session.ipAddress && (
                            <>
                              <Globe className='size-3' />
                              <span>{session.ipAddress}</span>
                              <span>•</span>
                            </>
                          )}
                          <Clock className='size-3' />
                          <span>
                            {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!isCurrent && (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-destructive hover:text-destructive'
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
            <p className='text-muted-foreground text-center py-4'>No active sessions found</p>
          )}
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className='border-amber-500/50 bg-amber-500/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-amber-600'>
            <Shield className='size-5' />
            Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='space-y-2 text-sm text-muted-foreground'>
            <li className='flex items-start gap-2'>
              <CheckCircle className='size-4 text-green-500 mt-0.5 shrink-0' />
              Use a strong, unique password that you don't use elsewhere
            </li>
            <li className='flex items-start gap-2'>
              <CheckCircle className='size-4 text-green-500 mt-0.5 shrink-0' />
              Review your active sessions regularly and sign out from unfamiliar devices
            </li>
            <li className='flex items-start gap-2'>
              <CheckCircle className='size-4 text-green-500 mt-0.5 shrink-0' />
              Keep your email address up to date for account recovery
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
