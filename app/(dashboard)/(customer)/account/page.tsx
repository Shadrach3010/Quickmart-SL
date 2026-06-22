import { ProfileSettings } from "@/features/profile/components/profile-settings";
import { ReferralCard } from "@/features/engagement";
import { requireProfile } from "@/lib/auth/session";
import { getCustomerAddresses, getReferralSummary } from "@/services/customer-account";

export default async function AccountPage() {
  const [profile, addresses, referral] = await Promise.all([
    requireProfile(),
    getCustomerAddresses(),
    getReferralSummary(),
  ]);
  return (
    <div className="marketplace-container py-8 md:py-12">
      <h1 className="text-3xl font-black tracking-tight md:text-5xl">Your profile</h1>
      <p className="mb-7 mt-2 text-muted-foreground">Personal details, delivery addresses, and preferences.</p>
      <ProfileSettings
        email={profile.email}
        firstName={profile.firstName ?? ""}
        lastName={profile.lastName ?? ""}
        phone={profile.phone ?? ""}
        addresses={addresses}
      />
      <div className="mt-6"><ReferralCard summary={referral} /></div>
    </div>
  );
}
