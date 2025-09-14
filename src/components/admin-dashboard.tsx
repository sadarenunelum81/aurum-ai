

"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { getDashboardData } from '@/lib/articles';
import { Skeleton } from './ui/skeleton';
import { Users, FileText, FileCheck, Library, AlertTriangle, Bot, Send, CalendarClock, History, Globe, Pencil } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { cn } from '@/lib/utils';

const chartConfig = {
  published: { label: "Published", color: "hsl(var(--chart-2))" },
  draft: { label: "Drafts", color: "hsl(var(--chart-5))" },
  failed: { label: "Failed", color: "hsl(var(--destructive))" },
  cron: { label: "Cron", color: "hsl(var(--chart-3))" },
  manual: { label: "Manual Gen", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const StatCard = ({ title, value, icon: Icon, loading, colorClass }: { title: string, value: number, icon: React.ElementType, loading: boolean, colorClass?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={cn("text-sm font-medium", colorClass)}>{title}</CardTitle>
            <Icon className={cn("h-4 w-4 text-muted-foreground", colorClass)} />
        </CardHeader>
        <CardContent>
            {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{value}</div>}
        </CardContent>
    </Card>
);

export function AdminDashboard() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats24h, setStats24h] = useState<any>(null);
  const [allTimeStats, setAllTimeStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = getDashboardData((data) => {
      setChartData(data.chartData);
      setStats24h(data.stats24h);
      setAllTimeStats(data.allTimeStats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Last 15 Days Activity</CardTitle>
          <CardDescription>An overview of content generation and status.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : (
             <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                <AreaChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.split(' ')[0]} // Show just 'MMM d'
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Area dataKey="published" type="natural" fill="var(--color-published)" fillOpacity={0.4} stroke="var(--color-published)" stackId="a" />
                    <Area dataKey="draft" type="natural" fill="var(--color-draft)" fillOpacity={0.4} stroke="var(--color-draft)" stackId="a" />
                    <Area dataKey="failed" type="natural" fill="var(--color-failed)" fillOpacity={0.4} stroke="var(--color-failed)" stackId="a" />
                </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

       <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Last 24 Hours</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard title="Total Posts" value={stats24h?.total || 0} icon={Library} loading={loading} colorClass="text-blue-500" />
            <StatCard title="Published" value={stats24h?.published || 0} icon={FileCheck} loading={loading} colorClass="text-green-500" />
            <StatCard title="Drafts" value={stats24h?.draft || 0} icon={FileText} loading={loading} colorClass="text-yellow-500" />
            <StatCard title="Failed" value={stats24h?.failed || 0} icon={AlertTriangle} loading={loading} colorClass="text-red-500" />
            <StatCard title="Cron Generated" value={stats24h?.cron || 0} icon={Bot} loading={loading} colorClass="text-purple-500" />
            <StatCard title="Manual Generated" value={stats24h?.manual || 0} icon={Send} loading={loading} colorClass="text-pink-500" />
          </div>
      </div>
      
       <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <h2 className="text-xl font-semibold">All-Time Statistics</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard title="Total Posts" value={allTimeStats?.total || 0} icon={Globe} loading={loading} colorClass="text-blue-500" />
            <StatCard title="Published" value={allTimeStats?.published || 0} icon={FileCheck} loading={loading} colorClass="text-green-500" />
            <StatCard title="Drafts" value={allTimeStats?.draft || 0} icon={FileText} loading={loading} colorClass="text-yellow-500" />
            <StatCard title="Editor Posts" value={allTimeStats?.editor || 0} icon={Pencil} loading={loading} colorClass="text-indigo-500" />
            <StatCard title="Manual Generations" value={allTimeStats?.manual || 0} icon={Send} loading={loading} colorClass="text-pink-500" />
            <StatCard title="Cron Generations" value={allTimeStats?.cron || 0} icon={Bot} loading={loading} colorClass="text-purple-500" />
          </div>
      </div>
    </div>
  );
}
