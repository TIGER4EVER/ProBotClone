import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Shield, Trash2 } from "lucide-react";

export default function ModerationPanel() {
  const [serverId, setServerId] = useState<number>(1);
  const [action, setAction] = useState<"ban" | "kick" | "mute" | "warn" | "clear">("warn");
  const [targetUserId, setTargetUserId] = useState("");
  const [targetUsername, setTargetUsername] = useState("");
  const [reason, setReason] = useState("");

  const logsQuery = trpc.moderation.getLogs.useQuery({ serverId, limit: 50 });
  const addActionMutation = trpc.moderation.addAction.useMutation();

  const handleAddAction = async () => {
    if (!targetUserId || !targetUsername) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await addActionMutation.mutateAsync({
        serverId,
        action,
        targetUserId,
        targetUsername,
        reason: reason || undefined,
      });
      toast.success(`${action.toUpperCase()} action recorded`);
      setTargetUserId("");
      setTargetUsername("");
      setReason("");
      logsQuery.refetch();
    } catch (error) {
      toast.error("Failed to record action");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Moderation Panel
          </h1>
          <p className="text-muted-foreground mt-2">Manage moderation actions and view audit logs</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Action Form */}
          <Card>
            <CardHeader>
              <CardTitle>Record Action</CardTitle>
              <CardDescription>Add a new moderation action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Action Type</label>
                <Select value={action} onValueChange={(v) => setAction(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warn">Warn</SelectItem>
                    <SelectItem value="mute">Mute</SelectItem>
                    <SelectItem value="kick">Kick</SelectItem>
                    <SelectItem value="ban">Ban</SelectItem>
                    <SelectItem value="clear">Clear Messages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Target User ID</label>
                <Input
                  placeholder="Discord user ID"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Target Username</label>
                <Input
                  placeholder="Discord username"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Reason</label>
                <Textarea
                  placeholder="Optional reason for the action"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleAddAction} disabled={addActionMutation.isPending} className="w-full">
                {addActionMutation.isPending ? "Recording..." : "Record Action"}
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Moderation Statistics</CardTitle>
              <CardDescription>Overview of moderation activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm text-muted-foreground">Total Actions</span>
                <span className="font-semibold">{logsQuery.data?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm text-muted-foreground">Warnings</span>
                <span className="font-semibold">{logsQuery.data?.filter((l) => l.action === "warn").length || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm text-muted-foreground">Bans</span>
                <span className="font-semibold">{logsQuery.data?.filter((l) => l.action === "ban").length || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm text-muted-foreground">Kicks</span>
                <span className="font-semibold">{logsQuery.data?.filter((l) => l.action === "kick").length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>Complete history of moderation actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logsQuery.data?.map((log) => (
                <div key={log.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-destructive/10 text-destructive">
                        {log.action.toUpperCase()}
                      </span>
                      <span className="font-medium">{log.targetUsername}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{log.reason || "No reason provided"}</p>
                    <p className="text-xs text-muted-foreground mt-1">By {log.moderatorUsername}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
