import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BarChart3, Shield, Coins, TrendingUp, MessageSquare, Settings } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const serversQuery = trpc.servers.list.useQuery();
  const selectedServer = serversQuery.data?.[0];

  if (!selectedServer) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>No Servers Found</CardTitle>
              <CardDescription>
                You don't have any Discord servers with this bot yet. Add the bot to your server to get started.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{selectedServer.name}</h1>
          <p className="text-muted-foreground mt-2">Manage your Discord server settings and features</p>
        </div>

        {/* Statistics Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Commands Used"
            value="1,234"
            icon={<BarChart3 className="h-4 w-4" />}
            trend="+12% from last week"
          />
          <StatCard
            title="Members Moderated"
            value="42"
            icon={<Shield className="h-4 w-4" />}
            trend="+3 this week"
          />
          <StatCard
            title="Economy Transactions"
            value="567"
            icon={<Coins className="h-4 w-4" />}
            trend="+8% increase"
          />
          <StatCard
            title="Active Levels"
            value="89"
            icon={<TrendingUp className="h-4 w-4" />}
            trend="Members ranking"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="economy">Economy</TabsTrigger>
            <TabsTrigger value="leveling">Leveling</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <OverviewTab serverId={selectedServer.id} />
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4">
            <ModerationTab serverId={selectedServer.id} />
          </TabsContent>

          <TabsContent value="economy" className="space-y-4">
            <EconomyTab serverId={selectedServer.id} />
          </TabsContent>

          <TabsContent value="leveling" className="space-y-4">
            <LevelingTab serverId={selectedServer.id} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsTab serverId={selectedServer.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ serverId }: { serverId: number }) {
  const statsQuery = trpc.activity.getStats.useQuery({ serverId });
  const feedQuery = trpc.activity.getFeed.useQuery({ serverId, limit: 10 });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Server Statistics</CardTitle>
          <CardDescription>Overview of server activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {statsQuery.data && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Commands</span>
                <span className="font-semibold">{statsQuery.data.totalCommands || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Members Moderated</span>
                <span className="font-semibold">{statsQuery.data.totalModerated || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Members</span>
                <span className="font-semibold">{statsQuery.data.totalMembers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Transactions</span>
                <span className="font-semibold">{statsQuery.data.totalTransactions || 0}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest server events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {feedQuery.data?.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 text-sm">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ModerationTab({ serverId }: { serverId: number }) {
  const logsQuery = trpc.moderation.getLogs.useQuery({ serverId, limit: 20 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderation Logs</CardTitle>
        <CardDescription>Recent moderation actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logsQuery.data?.map((log) => (
            <div key={log.id} className="flex items-start justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">
                  {log.action.toUpperCase()} - {log.targetUsername}
                </p>
                <p className="text-sm text-muted-foreground">{log.reason}</p>
                <p className="text-xs text-muted-foreground mt-1">By {log.moderatorUsername}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(log.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EconomyTab({ serverId }: { serverId: number }) {
  const leaderboardQuery = trpc.economy.getLeaderboard.useQuery({ serverId, limit: 10 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Economy Leaderboard</CardTitle>
        <CardDescription>Top members by balance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboardQuery.data?.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-3">
                <span className="font-bold text-muted-foreground">#{index + 1}</span>
                <span className="font-medium">{user.username}</span>
              </div>
              <span className="font-semibold">💰 {user.balance}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LevelingTab({ serverId }: { serverId: number }) {
  const leaderboardQuery = trpc.leveling.getLeaderboard.useQuery({ serverId, limit: 10 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Level Leaderboard</CardTitle>
        <CardDescription>Top members by level and XP</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboardQuery.data?.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-3">
                <span className="font-bold text-muted-foreground">#{index + 1}</span>
                <span className="font-medium">{user.username}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">Level {user.level}</p>
                <p className="text-xs text-muted-foreground">{user.xp} XP</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsTab({ serverId }: { serverId: number }) {
  const settingsQuery = trpc.servers.getSettings.useQuery({ serverId });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Settings</CardTitle>
        <CardDescription>Configure bot features for your server</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {settingsQuery.data && (
            <>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Moderation</p>
                  <p className="text-sm text-muted-foreground">Enable moderation commands</p>
                </div>
                <input type="checkbox" checked={settingsQuery.data.moderationEnabled} readOnly />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Economy</p>
                  <p className="text-sm text-muted-foreground">Enable economy system</p>
                </div>
                <input type="checkbox" checked={settingsQuery.data.economyEnabled} readOnly />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Leveling</p>
                  <p className="text-sm text-muted-foreground">Enable leveling system</p>
                </div>
                <input type="checkbox" checked={settingsQuery.data.levelingEnabled} readOnly />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Auto-Moderation</p>
                  <p className="text-sm text-muted-foreground">Enable auto-moderation</p>
                </div>
                <input type="checkbox" checked={settingsQuery.data.autoModEnabled} readOnly />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
