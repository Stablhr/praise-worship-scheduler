'use client';

import {useEffect, useRef, useState} from 'react';
import {
  Bell,
  Camera,
  ChevronDown,
  LogOut,
  Moon,
  Palette,
  Settings as SettingsIcon,
  Sun,
  Trash2
} from 'lucide-react';
import {BottomSheet} from '@/components/app/BottomSheet';

import {ConfirmDialog} from '@/components/app/ConfirmDialog';
import {PillButton} from '@/components/app/PillButton';
import {ScreenHeader} from '@/components/app/ScreenHeader';
import {Skeleton} from '@/components/ui/skeleton';
import {getFriendlyErrorMessage} from '@/lib/api/getFriendlyErrorMessage';
import {isAdmin} from '@/lib/auth/permissions';
import {Avatar} from '@/components/app/Avatar';
import {compressImage} from '@/lib/image/compress';
import {meQueryKey, useMeQuery} from '@/lib/hooks/auth/useMeQuery';
import {useLogout} from '@/lib/hooks/auth/useLogout';
import {useQueryClient} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import {removeProfilePhoto, updateMe, uploadProfilePhoto} from '@/lib/api/authApi';

type Theme = 'light' | 'dark' | 'system';

/** Settings screen (DESIGN.md section 6.9). */
export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {data: meData, isPending} = useMeQuery();
  const member = meData?.user;
  const canManage = isAdmin(member);

  const logout = useLogout();

  const [theme, setTheme] = useState<Theme>('system');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when member data first loads.
  useEffect(() => {
    if (member && !initialized) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme((member.preferences?.theme as Theme) ?? 'system');
      setNotificationsEnabled(member.preferences?.notificationsEnabled ?? true);
      setInitialized(true);
    }
  }, [member, initialized]);

  // Apply theme to document.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System: follow OS preference.
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  async function handleSavePreferences() {
    setIsSaving(true);
    setSaveError(null);
    try {
      const result = await updateMe({
        preferences: {
          theme,
          language: 'en',
          notificationsEnabled
        }
      });
      // Update the cache directly so the new theme persists immediately.
      queryClient.setQueryData(meQueryKey, result);
      void queryClient.invalidateQueries({queryKey: meQueryKey});
    } catch (err) {
      setSaveError(
        getFriendlyErrorMessage(err, 'We could not save your settings. Please try again.')
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePhotoUpload(file: File | Blob) {
    setIsUploadingPhoto(true);
    setPhotoError(null);
    try {
      const compressed = await compressImage(file);
      const result = await uploadProfilePhoto(compressed);
      queryClient.setQueryData(meQueryKey, result);
      void queryClient.invalidateQueries({queryKey: meQueryKey});
    } catch (err) {
      setPhotoError(
        getFriendlyErrorMessage(err, 'We could not upload the photo. Please try again.')
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handlePhotoRemove() {
    setIsUploadingPhoto(true);
    setPhotoError(null);
    try {
      const result = await removeProfilePhoto();
      queryClient.setQueryData(meQueryKey, result);
      void queryClient.invalidateQueries({queryKey: meQueryKey});
    } catch (err) {
      setPhotoError(
        getFriendlyErrorMessage(err, 'We could not remove the photo. Please try again.')
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void handlePhotoUpload(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleLogout() {
    try {
      await logout.mutateAsync();
    } finally {
      queryClient.clear();
      router.replace('/login');
    }
  }

  if (isPending || !member) {
    return (
      <>
        <ScreenHeader title="Settings" />
        <div className="mx-auto w-full max-w-[480px] space-y-3 px-4 py-4">
          <Skeleton className="h-16 w-full rounded-card" />
          <Skeleton className="h-16 w-full rounded-card" />
          <Skeleton className="h-16 w-full rounded-card" />
        </div>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title="Settings" />

      <div className="mx-auto w-full max-w-[480px] space-y-4 px-4 py-4">
        {/* Profile section */}
        <section className="rounded-card border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar
                name={member.name ?? ''}
                photoUrl={member.photoUrl}
                size="lg"
                className="!size-16"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                aria-label="Change profile photo"
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-colors duration-150 ease-out active:bg-primary-dark disabled:opacity-60"
              >
                <Camera className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-base font-semibold text-text">
                {member.name}
              </p>
              <p className="text-sm text-muted">{member.email}</p>
              {member.position && (
                <p className="text-xs text-muted">{member.position}</p>
              )}
              {member.photoUrl && (
                <button
                  type="button"
                  onClick={() => void handlePhotoRemove()}
                  disabled={isUploadingPhoto}
                  className="mt-1 flex items-center gap-1 text-xs text-danger transition-colors duration-150 ease-out active:underline disabled:opacity-60"
                >
                  <Trash2 className="size-3" aria-hidden="true" />
                  Remove photo
                </button>
              )}
            </div>
          </div>

          {photoError && (
            <p className="mt-2 text-sm text-danger">{photoError}</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Choose a profile photo"
          />

          {isUploadingPhoto && (
            <p className="mt-2 text-sm text-muted">Uploading photo…</p>
          )}
        </section>

        {/* App settings */}
        <section className="rounded-card border border-border bg-surface shadow-card">
          <h2 className="px-4 pt-3 font-heading text-sm font-semibold text-text">
            App Settings
          </h2>

          {/* Appearance */}
          <button
            type="button"
            onClick={() => setThemeSheetOpen(true)}
            className="flex min-h-[44px] w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors duration-150 ease-out active:bg-secondary"
          >
            <Palette className="size-5 text-primary" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium text-text">
              Appearance
            </span>
            <span className="flex items-center gap-1 text-sm text-muted">
              {theme === 'light'
                ? 'Light'
                : theme === 'dark'
                  ? 'Dark'
                  : 'System'}
              <ChevronDown className="size-4" aria-hidden="true" />
            </span>
          </button>

          {/* Notifications toggle */}
          <button
            type="button"
            onClick={() => setNotificationsEnabled(prev => !prev)}
            className="flex min-h-[44px] w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors duration-150 ease-out active:bg-secondary"
          >
            <Bell className="size-5 text-primary" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium text-text">
              Notifications
            </span>
            <span
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-150 ease-out ${
                notificationsEnabled ? 'bg-primary' : 'bg-muted-surface'
              }`}
            >
              <span
                className={`inline-block size-5 transform rounded-full bg-white shadow transition-transform duration-150 ease-out ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </span>
          </button>

          {/* Language */}
          <div className="flex min-h-[44px] items-center gap-3 px-4 py-3">
            <SettingsIcon className="size-5 text-primary" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium text-text">Language</span>
            <span className="text-sm text-muted">English</span>
          </div>
        </section>

        {/* Save button */}
        <PillButton
          type="button"
          onClick={() => void handleSavePreferences()}
          isLoading={isSaving}
          loadingLabel="Saving…"
        >
          Save changes
        </PillButton>

        {saveError && (
          <p className="text-sm text-danger">{saveError}</p>
        )}

        {/* System settings (admin only) */}
        {canManage && (
          <section className="rounded-card border border-border bg-surface shadow-card">
            <h2 className="px-4 pt-3 font-heading text-sm font-semibold text-text">
              System Settings
            </h2>
            <div className="flex min-h-[44px] items-center gap-3 border-b border-border px-4 py-3">
              <SettingsIcon className="size-5 text-primary" aria-hidden="true" />
              <span className="flex-1 text-sm font-medium text-text">
                Service times &amp; reminders
              </span>
              <span className="text-xs text-muted">Admin</span>
            </div>
            <div className="flex min-h-[44px] items-center gap-3 border-b border-border px-4 py-3">
              <SettingsIcon className="size-5 text-primary" aria-hidden="true" />
              <span className="flex-1 text-sm font-medium text-text">
                Help and Support
              </span>
              <span className="text-xs text-muted">Contact us</span>
            </div>
            <div className="flex min-h-[44px] items-center gap-3 px-4 py-3">
              <SettingsIcon className="size-5 text-primary" aria-hidden="true" />
              <span className="flex-1 text-sm font-medium text-text">
                About App
              </span>
              <span className="text-xs text-muted">v0.1.0</span>
            </div>
          </section>
        )}

        {/* Log out */}
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          disabled={logout.isPending}
          className="flex min-h-[44px] w-full items-center gap-3 rounded-card border border-danger/30 bg-surface px-4 py-3 text-left text-sm font-semibold text-danger transition-colors duration-150 ease-out active:bg-danger/10 disabled:opacity-60"
        >
          <LogOut className="size-5" aria-hidden="true" />
          {logout.isPending ? 'Logging out…' : 'Log out'}
        </button>

        <ConfirmDialog
          open={showLogoutConfirm}
          onOpenChange={setShowLogoutConfirm}
          title="Log out?"
          description="You will need to sign in again to access the app."
          confirmLabel="Log out"
          loadingLabel="Logging out…"
          isLoading={logout.isPending}
          isDestructive
          onConfirm={() => void handleLogout()}
        />
      </div>

      {/* Theme picker sheet */}
      <BottomSheet
        open={themeSheetOpen}
        onOpenChange={setThemeSheetOpen}
        title="Appearance"
        description="Choose how the app looks."
      >
        <div className="space-y-2">
          {(
            [
              {value: 'light' as Theme, label: 'Light', icon: Sun},
              {value: 'dark' as Theme, label: 'Dark', icon: Moon},
              {value: 'system' as Theme, label: 'System', icon: SettingsIcon}
            ] as const
          ).map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setTheme(option.value);
                  setThemeSheetOpen(false);
                }}
                className={`flex h-12 w-full items-center gap-3 rounded-card border px-4 text-base font-medium transition-colors duration-150 ease-out ${
                  theme === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface text-text active:bg-secondary'
                }`}
              >
                <Icon className="size-5" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}