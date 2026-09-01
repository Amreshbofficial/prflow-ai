"use client";

import { Save, User, Bell, Shield, Key, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  // Security form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: usersApi.getProfile,
  });

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setRole(userProfile.role || "");
    }
  }, [userProfile]);

  // Profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({
        type: "success",
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Update Failed",
        description: err.message || "Failed to update profile. Please try again.",
      });
    }
  });

  // Password mutation
  const changePasswordMutation = useMutation({
    mutationFn: usersApi.changePassword,
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        type: "success",
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Password Change Failed",
        description: err.message || "Failed to change password. Please try again.",
      });
    }
  });

  // Preferences mutation (notifications + AI)
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: any) => usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({
        type: "success",
        title: "Preferences Saved",
        description: "Your preferences have been updated successfully.",
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Update Failed",
        description: err.message || "Failed to save preferences.",
      });
    }
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, role });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        type: "error",
        title: "Passwords Don't Match",
        description: "New password and confirmation must match.",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        type: "error",
        title: "Password Too Short",
        description: "New password must be at least 8 characters.",
      });
      return;
    }
    changePasswordMutation.mutate({ current_password: currentPassword, new_password: newPassword });
  };

  const handleNotificationsSave = () => {
    updatePreferencesMutation.mutate({
      email_notifications: userProfile?.email_notifications ?? true,
      followup_reminders: userProfile?.followup_reminders ?? true,
      weekly_digest: userProfile?.weekly_digest ?? false,
    });
  };

  const handleAIPreferencesSave = () => {
    updatePreferencesMutation.mutate({
      default_tone: userProfile?.default_tone || "Professional & Direct",
      default_channel: userProfile?.default_channel || "Email",
    });
  };

  const tabs = [
    { id: "profile", label: "Profile & Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "api", label: "AI Preferences", icon: Key },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Hero header band */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#4f46e5]/[0.06] via-surface to-surface p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14),transparent_70%)]" />
        <div className="relative">
          <PageHeader
            title="Settings"
            description="Manage your account settings, preferences, and API integrations."
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md shadow-indigo-500/25"
                      : "text-text-secondary hover:bg-surface-secondary/80 hover:text-text-primary"
                  )}
                >
                  <Icon className={cn("h-4 w-4", activeTab === tab.id ? "text-white" : "text-text-muted")} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* ============ PROFILE TAB ============ */}
          {activeTab === "profile" && (
            <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] overflow-hidden">
              <form onSubmit={handleProfileSave}>
                <div className="px-6 py-5 border-b border-border bg-surface-secondary/30">
                  <h3 className="text-lg font-semibold text-text-primary">Personal Information</h3>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-indigo-500/25">
                      {isLoading ? "..." : (name ? name.substring(0, 2).toUpperCase() : "U")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{name || "User"}</p>
                      <p className="text-xs text-text-muted">{userProfile?.email || ""}</p>
                    </div>
                  </div>
                  
                  <div className="h-px w-full bg-border" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
                       <input
                         type="text"
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         placeholder="Enter your name"
                         className="block w-full rounded-xl border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm shadow-sm outline-none transition"
                       />
                     </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        value={userProfile?.email || ""} 
                        className="block w-full rounded-xl border border-border bg-surface-secondary/50 px-3 py-2 text-text-secondary cursor-not-allowed sm:text-sm shadow-sm outline-none transition" 
                        readOnly 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">Job Role</label>
                      <input 
                        type="text" 
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. PR Consultant"
                        className="block w-full rounded-xl border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm shadow-sm outline-none transition" 
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-border bg-surface-secondary/30 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending || isLoading}
                    className="group inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:from-[#4338ca] hover:to-[#4f46e5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============ SECURITY TAB ============ */}
          {activeTab === "security" && (
            <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] overflow-hidden">
              <form onSubmit={handlePasswordChange}>
                <div className="px-6 py-5 border-b border-border bg-surface-secondary/30">
                  <h3 className="text-lg font-semibold text-text-primary">Change Password</h3>
                  <p className="text-sm text-text-muted mt-1">Update your password to keep your account secure.</p>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                        className="block w-full rounded-xl border border-border bg-surface px-3 py-2 pr-10 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm shadow-sm outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-primary transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min. 8 characters)"
                        required
                        minLength={8}
                        className="block w-full rounded-xl border border-border bg-surface px-3 py-2 pr-10 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm shadow-sm outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-primary transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                      className={cn(
                        "block w-full rounded-xl border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:ring-2 sm:text-sm shadow-sm outline-none transition",
                        confirmPassword && newPassword !== confirmPassword
                          ? "border-error focus:border-error focus:ring-error/20"
                          : "border-border focus:border-[#4f46e5] focus:ring-[#4f46e5]/20"
                      )}
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Passwords do not match
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-border bg-surface-secondary/30 flex justify-end">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    className="group inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:from-[#4338ca] hover:to-[#4f46e5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Shield className="h-4 w-4" />
                    {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============ NOTIFICATIONS TAB ============ */}
          {activeTab === "notifications" && (
            <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="px-6 py-5 border-b border-border bg-surface-secondary/30">
                <h3 className="text-lg font-semibold text-text-primary">Notification Preferences</h3>
                <p className="text-sm text-text-muted mt-1">Control when and how you receive notifications.</p>
              </div>
              
              <div className="p-6 space-y-6">
                <ToggleSetting
                  label="Email Notifications"
                  description="Receive email notifications for important updates and activity."
                  checked={userProfile?.email_notifications ?? true}
                  onChange={(checked) => {
                    updatePreferencesMutation.mutate({ email_notifications: checked });
                  }}
                />
                <ToggleSetting
                  label="Follow-up Reminders"
                  description="Get reminded when follow-ups are due or overdue."
                  checked={userProfile?.followup_reminders ?? true}
                  onChange={(checked) => {
                    updatePreferencesMutation.mutate({ followup_reminders: checked });
                  }}
                />
                <ToggleSetting
                  label="Weekly Digest"
                  description="Receive a weekly summary of your outreach performance and pipeline."
                  checked={userProfile?.weekly_digest ?? false}
                  onChange={(checked) => {
                    updatePreferencesMutation.mutate({ weekly_digest: checked });
                  }}
                />
              </div>
            </div>
          )}

          {/* ============ AI PREFERENCES TAB ============ */}
          {activeTab === "api" && (
            <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="px-6 py-5 border-b border-border bg-surface-secondary/30">
                <h3 className="text-lg font-semibold text-text-primary">AI Generation Preferences</h3>
                <p className="text-sm text-text-muted mt-1">Set default options for AI-generated outreach content.</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Default Tone</label>
                  <select
                    value={userProfile?.default_tone || "Professional & Direct"}
                    onChange={(e) => updatePreferencesMutation.mutate({ default_tone: e.target.value })}
                    className="block w-full pl-3 pr-10 py-2 text-sm border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] rounded-xl transition-colors text-text-primary shadow-sm"
                  >
                    <option>Professional & Direct</option>
                    <option>Friendly & Casual</option>
                    <option>Enthusiastic</option>
                    <option>Consultative</option>
                  </select>
                  <p className="mt-1.5 text-xs text-text-muted">This tone will be pre-selected when generating new outreach.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Default Channel</label>
                  <select
                    value={userProfile?.default_channel || "Email"}
                    onChange={(e) => updatePreferencesMutation.mutate({ default_channel: e.target.value })}
                    className="block w-full pl-3 pr-10 py-2 text-sm border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] rounded-xl transition-colors text-text-primary shadow-sm"
                  >
                    <option>Email</option>
                    <option>LinkedIn</option>
                    <option>Twitter</option>
                  </select>
                  <p className="mt-1.5 text-xs text-text-muted">This channel will be pre-selected when generating new outreach.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable toggle component
function ToggleSetting({ label, description, checked, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-text-primary">{label}</h4>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:ring-offset-2 focus:ring-offset-surface",
          checked ? "bg-[#4f46e5]" : "bg-border"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
