'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCacheStats } from '@/hooks/useIFRS16Calculations';
import { BarChart3, RefreshCw, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';

interface CacheMonitorProps {
  className?: string;
  showDetails?: boolean;
}

export function CacheMonitor({ className, showDetails = false }: CacheMonitorProps) {
  const { stats, loading, error, fetchStats, clearAllCache, cleanupCache } = useCacheStats();
  const [isClearing, setIsClearing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearAllCache();
    } finally {
      setIsClearing(false);
    }
  };

  const handleCleanupCache = async () => {
    setIsCleaning(true);
    try {
      await cleanupCache();
    } finally {
      setIsCleaning(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  if (loading && !stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Cache Monitor
          </CardTitle>
          <CardDescription>Loading cache statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <BarChart3 className="h-5 w-5" />
            Cache Monitor - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={fetchStats} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Cache Monitor
          <Badge variant="outline" className="ml-auto">
            IFRS 16 Calculations
          </Badge>
        </CardTitle>
        <CardDescription>
          Monitor de performance do cache de cálculos IFRS 16
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(stats.hitRate)}
            </div>
            <div className="text-sm text-muted-foreground">Hit Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(stats.hits)}
            </div>
            <div className="text-sm text-muted-foreground">Cache Hits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatNumber(stats.misses)}
            </div>
            <div className="text-sm text-muted-foreground">Cache Misses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(stats.cacheSize)}
            </div>
            <div className="text-sm text-muted-foreground">Entries</div>
          </div>
        </div>

        {/* Barra de progresso do hit rate */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Cache Hit Rate</span>
            <span>{formatPercentage(stats.hitRate)}</span>
          </div>
          <Progress 
            value={stats.hitRate} 
            className="h-2"
          />
        </div>

        {/* Ações do cache */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={fetchStats}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            onClick={handleCleanupCache}
            variant="outline"
            size="sm"
            disabled={isCleaning}
          >
            <Zap className="h-4 w-4 mr-2" />
            {isCleaning ? 'Cleaning...' : 'Cleanup'}
          </Button>
          
          <Button
            onClick={handleClearCache}
            variant="destructive"
            size="sm"
            disabled={isClearing}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isClearing ? 'Clearing...' : 'Clear All'}
          </Button>
        </div>

        {/* Detalhes adicionais */}
        {showDetails && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Detalhes Técnicos</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground">Total Requests</div>
                <div className="text-lg font-semibold">{formatNumber(stats.totalRequests)}</div>
              </div>
              
              <div>
                <div className="font-medium text-muted-foreground">Cache Size</div>
                <div className="text-lg font-semibold">{formatNumber(stats.cacheSize)} entries</div>
              </div>
              
              {stats.oldestEntry && (
                <div>
                  <div className="font-medium text-muted-foreground">Oldest Entry</div>
                  <div className="text-sm">
                    {new Date(stats.oldestEntry).toLocaleString()}
                  </div>
                </div>
              )}
              
              {stats.newestEntry && (
                <div>
                  <div className="font-medium text-muted-foreground">Newest Entry</div>
                  <div className="text-sm">
                    {new Date(stats.newestEntry).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status do cache */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            stats.hitRate > 70 ? 'bg-green-500' : 
            stats.hitRate > 40 ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-muted-foreground">
            Cache status: {
              stats.hitRate > 70 ? 'Excellent' : 
              stats.hitRate > 40 ? 'Good' : 'Needs optimization'
            }
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default CacheMonitor;
