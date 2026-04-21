import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Coins, TrendingUp, Plus } from "lucide-react";

export default function EconomyPanel() {
  const [serverId, setServerId] = useState<number>(1);
  const [fromUserId, setFromUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const leaderboardQuery = trpc.economy.getLeaderboard.useQuery({ serverId, limit: 100 });
  const transfersQuery = trpc.economy.getTransfers.useQuery({ serverId, limit: 50 });
  const shopItemsQuery = trpc.economy.getShopItems.useQuery({ serverId });
  const transferMutation = trpc.economy.transfer.useMutation();
  const addShopItemMutation = trpc.economy.addShopItem.useMutation();

  const handleTransfer = async () => {
    if (!fromUserId || !toUserId || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await transferMutation.mutateAsync({
        serverId,
        fromUserId,
        toUserId,
        amount: parseFloat(amount),
      });
      toast.success("Transfer completed");
      setFromUserId("");
      setToUserId("");
      setAmount("");
      leaderboardQuery.refetch();
      transfersQuery.refetch();
    } catch (error) {
      toast.error("Transfer failed");
    }
  };

  const handleAddShopItem = async () => {
    if (!itemName || !itemPrice) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addShopItemMutation.mutateAsync({
        serverId,
        name: itemName,
        price: parseFloat(itemPrice),
      });
      toast.success("Shop item added");
      setItemName("");
      setItemPrice("");
      shopItemsQuery.refetch();
    } catch (error) {
      toast.error("Failed to add shop item");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Coins className="h-8 w-8" />
            Economy System
          </h1>
          <p className="text-muted-foreground mt-2">Manage user balances, transfers, and shop items</p>
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="shop">Shop</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Economy Leaderboard</CardTitle>
                <CardDescription>Top members by balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {leaderboardQuery.data?.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-xs text-muted-foreground">ID: {user.userId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">💰 {user.balance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transfers" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Transfer Balance</CardTitle>
                  <CardDescription>Transfer currency between users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">From User ID</label>
                    <Input
                      placeholder="Source user ID"
                      value={fromUserId}
                      onChange={(e) => setFromUserId(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">To User ID</label>
                    <Input
                      placeholder="Destination user ID"
                      value={toUserId}
                      onChange={(e) => setToUserId(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Amount</label>
                    <Input
                      type="number"
                      placeholder="Amount to transfer"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleTransfer} disabled={transferMutation.isPending} className="w-full">
                    {transferMutation.isPending ? "Processing..." : "Transfer"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transfers</CardTitle>
                  <CardDescription>Latest transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {transfersQuery.data?.slice(0, 10).map((transfer) => (
                      <div key={transfer.id} className="flex items-center justify-between p-2 border rounded text-sm">
                        <div>
                          <p className="font-medium">{transfer.fromUserId} → {transfer.toUserId}</p>
                          <p className="text-xs text-muted-foreground">{transfer.reason || "No reason"}</p>
                        </div>
                        <span className="font-semibold">💰 {transfer.amount}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shop" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Add Shop Item</CardTitle>
                  <CardDescription>Create a new purchasable item</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Item Name</label>
                    <Input
                      placeholder="Item name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      type="number"
                      placeholder="Price in currency"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleAddShopItem} disabled={addShopItemMutation.isPending} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {addShopItemMutation.isPending ? "Adding..." : "Add Item"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shop Items</CardTitle>
                  <CardDescription>Available items for purchase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {shopItemsQuery.data?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <span className="font-semibold">💰 {item.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
