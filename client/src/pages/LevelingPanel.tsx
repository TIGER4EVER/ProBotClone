import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { TrendingUp, Save } from "lucide-react";

export default function LevelingPanel() {
  const [serverId, setServerId] = useState<number>(1);
  const [levelUpMessage, setLevelUpMessage] = useState("");
  const [levelUpChannelId, setLevelUpChannelId] = useState("");
  const [xpMultiplier, setXpMultiplier] = useState("1");

  const leaderboardQuery = trpc.leveling.getLeaderboard.useQuery({ serverId, limit: 100 });
  const settingsQuery = trpc.leveling.getSettings.useQuery({ serverId });
  const updateSettingsMutation = trpc.leveling.updateSettings.useMutation();

  // Initialize form with existing settings
  if (settingsQuery.data && !levelUpMessage) {
    setLevelUpMessage(settingsQuery.data.levelUpMessage);
    setLevelUpChannelId(settingsQuery.data.levelUpChannelId || "");
    setXpMultiplier(settingsQuery.data.xpMultiplier?.toString() || "1");
  }

  const handleUpdateSettings = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        serverId,
        levelUpMessage: levelUpMessage || undefined,
        levelUpChannelId: levelUpChannelId || undefined,
        xpMultiplier: parseFloat(xpMultiplier) || 1,
      });
      toast.success("Settings updated");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Leveling System
          </h1>
          <p className="text-muted-foreground mt-2">Configure XP rewards, level-up messages, and view member rankings</p>
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Level Leaderboard</CardTitle>
                <CardDescription>Members ranked by level and XP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {leaderboardQuery.data?.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-xs text-muted-foreground">ID: {user.userId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">⭐ Level {user.level}</p>
                        <p className="text-xs text-muted-foreground">{user.xp} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Leveling Configuration</CardTitle>
                <CardDescription>Customize level-up messages and XP rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Level-Up Message</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Use {"{user}"} for username and {"{level}"} for level number
                  </p>
                  <Textarea
                    placeholder="Congratulations {user}! You reached level {level}!"
                    value={levelUpMessage}
                    onChange={(e) => setLevelUpMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Level-Up Channel ID</label>
                  <Input
                    placeholder="Discord channel ID for level-up announcements"
                    value={levelUpChannelId}
                    onChange={(e) => setLevelUpChannelId(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">XP Multiplier</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="1.0"
                    value={xpMultiplier}
                    onChange={(e) => setXpMultiplier(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Multiplier for XP rewards (1.0 = normal, 2.0 = double XP)
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Preview</p>
                  <p className="text-sm text-muted-foreground">
                    {levelUpMessage.replace("{user}", "ExampleUser").replace("{level}", "10")}
                  </p>
                </div>

                <Button onClick={handleUpdateSettings} disabled={updateSettingsMutation.isPending} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
