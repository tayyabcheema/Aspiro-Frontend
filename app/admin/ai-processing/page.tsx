"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  FileText, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Eye,
  RefreshCw,
  Calendar,
  Download
} from 'lucide-react';
import { getApiUrl } from '@/lib/api-config';

interface AIProcessingStats {
  totalProcessings: number;
  avgAutoFillSuccessRate: number;
  avgAiSuggestionSuccessRate: number;
  avgProcessingTime: number;
  totalDocumentsProcessed: number;
  totalQuestionsProcessed: number;
  avgPreFillAccepted: number;
  avgAiSuggestionsAccepted: number;
}

interface ProcessingLog {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  documents: Array<{
    filename: string;
    documentType: string;
    parsingSuccess: boolean;
    textLength: number;
  }>;
  statistics: {
    totalQuestions: number;
    autoFillQuestions: number;
    aiSuggestionQuestions: number;
    noMatchQuestions: number;
    autoFillSuccessRate: number;
    aiSuggestionSuccessRate: number;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PerformanceMetrics {
  performanceMetrics: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    dailyProcessings: number;
    avgAutoFillSuccessRate: number;
    avgAiSuggestionSuccessRate: number;
    avgProcessingTime: number;
  }>;
  errorTrends: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    errorCount: number;
  }>;
  summary: {
    totalDays: number;
    avgDailyProcessings: number;
    avgAutoFillSuccessRate: number;
    avgAiSuggestionSuccessRate: number;
    avgProcessingTime: number;
  };
}

export default function AIProcessingPage() {
  const [stats, setStats] = useState<AIProcessingStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<ProcessingLog[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');
  const [selectedLog, setSelectedLog] = useState<ProcessingLog | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch statistics
      const statsResponse = await fetch(
        `${getApiUrl('/ai-processing/statistics')}?days=${dateRange}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const statsData = await statsResponse.json();
      setStats(statsData.data.overview);
      setRecentLogs(statsData.data.recentLogs);

      // Fetch performance metrics
      const metricsResponse = await fetch(
        `${getApiUrl('/ai-processing/performance')}?days=${dateRange}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setPerformanceMetrics(metricsData.data);
      }

    } catch (err) {
      console.error('Error fetching AI processing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'processing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      case 'processing': return 'Processing';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e2439] flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-cyan-300">Loading AI processing data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0e2439] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-semibold text-red-100">Error Loading Data</h2>
          <p className="text-red-300">{error}</p>
          <Button onClick={fetchData} className="bg-red-500 hover:bg-red-400">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e2439] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-100 flex items-center gap-3">
              <Brain className="h-8 w-8 text-cyan-400" />
              AI Processing Analytics
            </h1>
            <p className="text-cyan-300/80 mt-2">
              Monitor document parsing and AI suggestion performance
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32 bg-[#0e2439]/50 border-cyan-400/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={fetchData} variant="outline" className="border-cyan-400/30 text-cyan-300">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#0e2439]/50 border-cyan-400/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Total Processings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-100">{stats.totalProcessings}</div>
                <p className="text-xs text-cyan-300/80">
                  {stats.totalDocumentsProcessed} documents processed
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0e2439]/50 border-green-400/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Auto-fill Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-100">
                  {stats.avgAutoFillSuccessRate.toFixed(1)}%
                </div>
                <p className="text-xs text-green-300/80">
                  Average across all processings
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0e2439]/50 border-purple-400/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Suggestion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-100">
                  {stats.avgAiSuggestionSuccessRate.toFixed(1)}%
                </div>
                <p className="text-xs text-purple-300/80">
                  Average suggestion success
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0e2439]/50 border-blue-400/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Avg Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-100">
                  {(stats.avgProcessingTime / 1000).toFixed(1)}s
                </div>
                <p className="text-xs text-blue-300/80">
                  Per processing session
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Processing Logs */}
        <Card className="bg-[#0e2439]/50 border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Processing Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-4 bg-[#0e2439]/30 border border-cyan-400/10 rounded-lg hover:border-cyan-400/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(log.status)}`} />
                      <div>
                        <p className="text-cyan-100 font-medium">{log.user.name}</p>
                        <p className="text-cyan-300/80 text-sm">{log.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-cyan-100 text-sm">{getStatusText(log.status)}</p>
                      <p className="text-cyan-300/80 text-xs">{formatDate(log.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-cyan-300/80">Documents</p>
                      <p className="text-cyan-100">{log.documents.length}</p>
                    </div>
                    <div>
                      <p className="text-cyan-300/80">Auto-fill</p>
                      <p className="text-green-400">{log.statistics.autoFillQuestions}</p>
                    </div>
                    <div>
                      <p className="text-cyan-300/80">AI Suggestions</p>
                      <p className="text-purple-400">{log.statistics.aiSuggestionQuestions}</p>
                    </div>
                    <div>
                      <p className="text-cyan-300/80">Success Rate</p>
                      <p className="text-cyan-100">{log.statistics.autoFillSuccessRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics Chart Placeholder */}
        {performanceMetrics && (
          <Card className="bg-[#0e2439]/50 border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-cyan-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-400/10 border border-green-400/30 rounded-lg">
                    <p className="text-green-300 text-sm">Avg Daily Processings</p>
                    <p className="text-green-100 text-xl font-bold">
                      {performanceMetrics.summary.avgDailyProcessings.toFixed(1)}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-400/10 border border-purple-400/30 rounded-lg">
                    <p className="text-purple-300 text-sm">Avg Auto-fill Rate</p>
                    <p className="text-purple-100 text-xl font-bold">
                      {performanceMetrics.summary.avgAutoFillSuccessRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 bg-blue-400/10 border border-blue-400/30 rounded-lg">
                    <p className="text-blue-300 text-sm">Avg Processing Time</p>
                    <p className="text-blue-100 text-xl font-bold">
                      {(performanceMetrics.summary.avgProcessingTime / 1000).toFixed(1)}s
                    </p>
                  </div>
                </div>
                
                <div className="text-center text-cyan-300/80 text-sm">
                  Performance data for the last {performanceMetrics.summary.totalDays} days
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
