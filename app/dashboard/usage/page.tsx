"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Database, HardDrive, Zap } from "lucide-react";

export default function UsagePage() {
  // Mock usage data - replace with actual usage API
  const usage = {
    firestore: {
      reads: 1250,
      maxReads: 50000,
      writes: 450,
      maxWrites: 20000,
    },
    storage: {
      used: 1073741824, // 1 GB
      max: 5368709120, // 5 GB
    },
    functions: {
      count: 1234,
      max: 2000000,
    },
  };

  const calculatePercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100).toFixed(1);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage < 50) return "text-green-600";
    if (percentage < 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Usage & Quotas</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your service usage and quotas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Database</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Reads</span>
                <span className={getStatusColor(
                  parseFloat(calculatePercentage(usage.firestore.reads, usage.firestore.maxReads))
                )}>
                  {usage.firestore.reads.toLocaleString()} / {usage.firestore.maxReads.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${calculatePercentage(usage.firestore.reads, usage.firestore.maxReads)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Writes</span>
                <span className={getStatusColor(
                  parseFloat(calculatePercentage(usage.firestore.writes, usage.firestore.maxWrites))
                )}>
                  {usage.firestore.writes.toLocaleString()} / {usage.firestore.maxWrites.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${calculatePercentage(usage.firestore.writes, usage.firestore.maxWrites)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
              <CardTitle>Storage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-1">
              <span>Used</span>
              <span className={getStatusColor(
                parseFloat(calculatePercentage(usage.storage.used, usage.storage.max))
              )}>
                {(usage.storage.used / 1024 / 1024 / 1024).toFixed(2)} GB / 5 GB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{
                  width: `${calculatePercentage(usage.storage.used, usage.storage.max)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* API Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>API Requests</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-1">
              <span>Invocations</span>
              <span className={getStatusColor(
                parseFloat(calculatePercentage(usage.functions.count, usage.functions.max))
              )}>
                {usage.functions.count.toLocaleString()} / {usage.functions.max.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{
                  width: `${calculatePercentage(usage.functions.count, usage.functions.max)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Tips to Stay Free</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Images are compressed before upload</li>
              <li>✓ Offline mode uses IndexedDB (not counted)</li>
              <li>✓ Cache aggressively to reduce reads</li>
            <li>✓ Batch database operations</li>
              <li>✓ Monitor usage weekly</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Safeguards Active</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✅ Budget alerts enabled</li>
            <li>✅ Spending limit: $1.00</li>
            <li>✅ Auto-disable on limit</li>
            <li>✅ Image compression enabled</li>
            <li>✅ Offline-first architecture</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

