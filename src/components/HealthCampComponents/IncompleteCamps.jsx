import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue } from 'firebase/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CampTable from './SubComponents/UpdateBy';

const CampStatusView = ({ activeContext, onCampCodeClick }) => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const campsRef = ref(database, 'healthCamps');

    const handleValue = (snapshot) => {
      try {
        if (snapshot.exists()) {
          const allCamps = Object.entries(snapshot.val())
            .map(([key, camp]) => ({
              id: key,
              ...camp
            }))
            // Filter out cancelled camps before sorting
            .filter(camp => camp.status !== 'cancelled')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          setCamps(allCamps);
        } else {
          setCamps([]);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch camps: ' + err.message);
        setLoading(false);
      }
    };

    const unsubscribe = onValue(campsRef, handleValue);
    return () => unsubscribe();
  }, []);

  // Updated filters to exclude cancelled camps
  const incompleteCamps = camps.filter(camp => camp.status !== 'completed');
  
  const pendingClosureCamps = camps.filter(camp => 
    camp.status === 'completed' && !camp.reportStatus
  );
  
  const closedCamps = camps.filter(camp => 
    camp.status === 'completed' && camp.reportStatus === 'sent'
  );

  const getContextTabs = () => {
    switch (activeContext) {
      case 'schedule':
        return ['incomplete'];
      case 'complete':
        return ['incomplete', 'pendingClosure'];
      case 'close':
        return ['pendingClosure', 'closed'];
      default:
        return ['incomplete', 'pendingClosure', 'closed'];
    }
  };

  const getDefaultTab = () => {
    switch (activeContext) {
      case 'schedule':
        return 'incomplete';
      case 'complete':
        return 'incomplete';
      case 'close':
        return 'pendingClosure';
      default:
        return 'incomplete';
    }
  };

  const tabLabels = {
    incomplete: {
      label: 'Scheduled Camps',
      count: incompleteCamps.length,
      data: incompleteCamps,
    },
    pendingClosure: {
      label: 'Report Pending',
      count: pendingClosureCamps.length,
      data: pendingClosureCamps,
    },
    closed: {
      label: 'Closed',
      count: closedCamps.length,
      data: closedCamps,
    },
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Health Camps Overview</CardTitle>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-48" role="status">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}

if (error) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Health Camps Overview</CardTitle>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border-l-4 border-red-400 p-4" role="alert">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const contextTabs = getContextTabs();
  const gridColumns = `grid-cols-${contextTabs.length}`;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Health Camps Overview</CardTitle>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
        >
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </CardHeader>
      <CardContent>
        {isExpanded && (
          <Tabs defaultValue={getDefaultTab()} className="w-full">
            <TabsList className={`mb-4 grid w-full ${gridColumns}`}>
              {contextTabs.map((tabKey) => (
                <TabsTrigger key={tabKey} value={tabKey}>
                  {tabLabels[tabKey].label} ({tabLabels[tabKey].count})
                </TabsTrigger>
              ))}
            </TabsList>
            {contextTabs.map((tabKey) => (
              <TabsContent key={tabKey} value={tabKey}>
                {tabLabels[tabKey].data.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No {tabLabels[tabKey].label.toLowerCase()} found
                  </div>
                ) : (
                  <CampTable 
                    camps={tabLabels[tabKey].data} 
                    type={tabKey}
                    onCampCodeClick={onCampCodeClick}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default CampStatusView;