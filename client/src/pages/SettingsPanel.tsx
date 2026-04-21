import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Settings, MessageSquare, Shield, Zap } from "lucide-react";

export default function SettingsPanel() {
  const [serverId, setServerId] = useState<number>(1);
  const [welcomeMsg, setWelcomeMsg] = useState("");
  const [leaveMsg, setLeaveMsg] = useState("");
  const [bgImageUrl, setBgImageUrl] = useState("");
  const [spamThreshold, setSpamThreshold] = useState("5");
  const [spamTimeWindow, setSpamTimeWindow] = useState("5");
  const [linkBlacklist, setLinkBlacklist] = useState("");
  const [badWords, setBadWords] = useState("");

  const serverSettingsQuery = trpc.servers.getSettings.useQuery({ serverId });
  const welcomeSettingsQuery = trpc.welcome.getSettings.useQuery({ serverId });
  const automodSettingsQuery = trpc.automod.getSettings.useQuery({ serverId });

  const updateFeaturesMutation = trpc.servers.updateFeatures.useMutation();
  const updateWelcomeMutation = trpc.welcome.updateSettings.useMutation();
  const updateAutomodMutation = trpc.automod.updateSettings.useMutation();

  // Initialize forms
  if (welcomeSettingsQuery.data && !welcomeMsg) {
    setWelcomeMsg(welcomeSettingsQuery.data.welcomeMessage);
    setLeaveMsg(welcomeSettingsQuery.data.leaveMessage);
    setBgImageUrl(welcomeSettingsQuery.data.backgroundImageUrl || "");
  }

  if (automodSettingsQuery.data && !spamThreshold) {
    setSpamThreshold(automodSettingsQuery.data.spamThreshold?.toString() || "5");
    setSpamTimeWindow(automodSettingsQuery.data.spamTimeWindow?.toString() || "5");
    setLinkBlacklist(Array.isArray(automodSettingsQuery.data.linkBlacklist) ? automodSettingsQuery.data.linkBlacklist.join("\n") : "");
    setBadWords(Array.isArray(automodSettingsQuery.data.badWords) ? automodSettingsQuery.data.badWords.join("\n") : "");
  }

  const handleUpdateFeatures = async (updates: Record<string, boolean>) => {
    try {
      await updateFeaturesMutation.mutateAsync({
        serverId,
        ...updates,
      });
      toast.success("Features updated");
    } catch (error) {
      toast.error("Failed to update features");
    }
  };

  const handleUpdateWelcome = async () => {
    try {
      await updateWelcomeMutation.mutateAsync({
        serverId,
        welcomeMessage: welcomeMsg || undefined,
        leaveMessage: leaveMsg || undefined,
        backgroundImageUrl: bgImageUrl || undefined,
      });
      toast.success("Welcome settings updated");
    } catch (error) {
      toast.error("Failed to update welcome settings");
    }
  };

  const handleUpdateAutomod = async () => {
    try {
      await updateAutomodMutation.mutateAsync({
        serverId,
        spamThreshold: parseInt(spamThreshold) || 5,
        spamTimeWindow: parseInt(spamTimeWindow) || 5,
        linkBlacklist: linkBlacklist.split("\n").filter((l) => l.trim()),
        badWords: badWords.split("\n").filter((w) => w.trim()),
      });
      toast.success("Auto-moderation settings updated");
    } catch (error) {
      toast.error("Failed to update auto-moderation settings");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Server Settings
          </h1>
          <p className="text-muted-foreground mt-2">Configure bot features, welcome messages, and auto-moderation</p>
        </div>

        <Tabs defaultValue="features" className="space-y-4">
          <TabsList>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="welcome">Welcome/Leave</TabsTrigger>
            <TabsTrigger value="automod">Auto-Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bot Features</CardTitle>
                <CardDescription>Enable or disable bot features for your server</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {serverSettingsQuery.data && (
                  <>
                    <FeatureToggle
                      label="Moderation"
                      description="Enable moderation commands (ban, kick, mute, warn)"
                      icon={<Shield className="h-5 w-5" />}
                      checked={serverSettingsQuery.data.moderationEnabled}
                      onChange={(checked) => handleUpdateFeatures({ moderationEnabled: checked })}
                    />
                    <FeatureToggle
                      label="Economy"
                      description="Enable economy system with balances and transfers"
                      icon={<MessageSquare className="h-5 w-5" />}
                      checked={serverSettingsQuery.data.economyEnabled}
                      onChange={(checked) => handleUpdateFeatures({ economyEnabled: checked })}
                    />
                    <FeatureToggle
                      label="Leveling"
                      description="Enable leveling system with XP and ranks"
                      icon={<Zap className="h-5 w-5" />}
                      checked={serverSettingsQuery.data.levelingEnabled}
                      onChange={(checked) => handleUpdateFeatures({ levelingEnabled: checked })}
                    />
                    <FeatureToggle
                      label="Auto-Moderation"
                      description="Enable automatic moderation filters"
                      icon={<Shield className="h-5 w-5" />}
                      checked={serverSettingsQuery.data.autoModEnabled}
                      onChange={(checked) => handleUpdateFeatures({ autoModEnabled: checked })}
                    />
                    <FeatureToggle
                      label="Welcome Messages"
                      description="Send welcome messages to new members"
                      icon={<MessageSquare className="h-5 w-5" />}
                      checked={serverSettingsQuery.data.welcomeEnabled}
                      onChange={(checked) => handleUpdateFeatures({ welcomeEnabled: checked })}
                    />
                    <FeatureToggle
                      label="Anti-Spam"
                      description="Detect and prevent spam messages"
                      icon={<Zap className="h-5 w-5" />}
                      checked={serverSettingsQuery.data.antiSpamEnabled}
                      onChange={(checked) => handleUpdateFeatures({ antiSpamEnabled: checked })}
                    />
                    <FeatureToggle
                      label="Anti-Link"
                      description="Prevent certain links from being shared"
                      icon={<Shield className="h-5 w-5" />}
                      checked={serverSettingsQuery.data.antiLinkEnabled}
                      onChange={(checked) => handleUpdateFeatures({ antiLinkEnabled: checked })}
                    />
                    <FeatureToggle
                      label="Anti-Bad Words"
                      description="Filter inappropriate language"
                      icon={<Shield className="h-5 w-5" />}
                      checked={serverSettingsQuery.data.antiBadWordsEnabled}
                      onChange={(checked) => handleUpdateFeatures({ antiBadWordsEnabled: checked })}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="welcome" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Welcome & Leave Messages</CardTitle>
                <CardDescription>Customize messages for members joining and leaving</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Welcome Message</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Use {"{user}"} for username and {"{server}"} for server name
                  </p>
                  <Textarea
                    placeholder="Welcome to {server}! {user}"
                    value={welcomeMsg}
                    onChange={(e) => setWelcomeMsg(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Leave Message</label>
                  <Textarea
                    placeholder="{user} has left the server."
                    value={leaveMsg}
                    onChange={(e) => setLeaveMsg(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Background Image URL</label>
                  <Input
                    placeholder="https://example.com/image.png"
                    value={bgImageUrl}
                    onChange={(e) => setBgImageUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Image URL for welcome card background
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Preview</p>
                  <p className="text-sm text-muted-foreground">
                    {welcomeMsg.replace("{user}", "NewMember").replace("{server}", "Your Server")}
                  </p>
                </div>

                <Button onClick={handleUpdateWelcome} disabled={updateWelcomeMutation.isPending} className="w-full">
                  {updateWelcomeMutation.isPending ? "Saving..." : "Save Welcome Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automod" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Moderation Settings</CardTitle>
                <CardDescription>Configure spam detection and content filters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Spam Threshold</label>
                    <Input
                      type="number"
                      min="1"
                      value={spamThreshold}
                      onChange={(e) => setSpamThreshold(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Number of messages before flagging as spam
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Time Window (seconds)</label>
                    <Input
                      type="number"
                      min="1"
                      value={spamTimeWindow}
                      onChange={(e) => setSpamTimeWindow(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Time period for spam detection
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Link Blacklist</label>
                  <Textarea
                    placeholder="Enter one link pattern per line&#10;discord.gg&#10;twitch.tv"
                    value={linkBlacklist}
                    onChange={(e) => setLinkBlacklist(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Bad Words Filter</label>
                  <Textarea
                    placeholder="Enter one word per line&#10;badword1&#10;badword2"
                    value={badWords}
                    onChange={(e) => setBadWords(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button onClick={handleUpdateAutomod} disabled={updateAutomodMutation.isPending} className="w-full">
                  {updateAutomodMutation.isPending ? "Saving..." : "Save Auto-Moderation Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function FeatureToggle({
  label,
  description,
  icon,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
