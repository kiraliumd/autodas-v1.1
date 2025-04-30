import { ProfileForm } from "@/components/profile/profile-form"
import { SubscriptionManager } from "@/components/subscription/subscription-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2">Gerencie suas preferências e informações de conta.</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="subscription">Assinatura</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
