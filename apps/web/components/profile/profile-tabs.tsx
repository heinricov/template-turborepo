import React from "react";
import { ScrollArea, ScrollBar } from "@workspace/shadcn/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/shadcn/ui/tabs";
import { cn } from "@workspace/shadcn/lib/utils";

type TabItem = {
  value: string;
  name: string;
  content: React.ReactNode;
};

interface ProfileTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
}

export default function ProfileTabs({
  tabs,
  defaultValue,
}: ProfileTabsProps) {
  return (
    <Tabs
      className="mt-8 mx-auto w-full max-w-3xl"
      defaultValue={defaultValue ?? tabs[0]?.value}
    >
      <div className="border-b">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList
            className={cn(
              "rounded-none bg-transparent p-0",
              "*:rounded-none *:border-0 *:border-b-2 *:px-4 *:text-muted-foreground",
              "*:data-[state=active]:border-b-foreground",
              "*:data-[state=active]:bg-transparent",
              "*:data-[state=active]:text-foreground",
              "*:data-[state=active]:shadow-none"
            )}
          >
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="mt-6"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}