import ProfileHeader from "./profile-header";
import ProfileTabs from "./profile-tabs";
import ProfileInfo from "./profile-info";
import ProfileSettings from "./profile-settings";

const tabs = [
  {
    name: "Profile Info",
    value: "profile-info",
    content: <ProfileInfo />,
  },
  {
    name: "Profile Settings",
    value: "profile-settings",
    content: <ProfileSettings />,
  },
];

export function ProfilePage() {
  return (
    <div className="min-h-dvh py-20">
      <ProfileHeader />

      <ProfileTabs tabs={tabs} />
    </div>
  );
}