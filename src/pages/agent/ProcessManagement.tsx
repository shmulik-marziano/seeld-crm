import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Download, Trash2, Users, Search, Filter, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Process {
  id: string;
  client_id: string;
  client_name?: string;
  client_id_number?: string;
  process_type: string;
  company?: string;
  product_name?: string;
  document_file_url?: string;
  documents_sent?: string[];
  send_method?: string;
  sent_at?: string;
  status: string;
  status_info?: string;
  control_status?: string;
  control_notes?: string;
  notes?: string;
  created_at: string;
}

const processTypeLabels: Record<string, string> = {
  fishing_policy: 'פישינג פוליסה',
  fishing_mislaka: 'פישינג מסלקה',
  power_of_attorney: 'יפוי כח',
  enrollment: 'הצטרפות',
  material_action: 'פעולה בחומר',
  update_details: 'עדכון פרטי לקוח',
  transfer: 'ניוד',
  consolidation: 'איחוד קופות',
  other: 'אחר'
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'ממתין', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'בתהליך', color: 'bg-blue-100 text-blue-800' },
  sent: { label: 'נשלח', color: 'bg-purple-100 text-purple-800' },
  received_ok: { label: 'התקבל תקין', color: 'bg-green-100 text-green-800' },
  manual_process: { label: 'הועבר לתהליך ידני', color: 'bg-amber-100 text-amber-800' },
  needs_fix: { label: 'נדרש תיקון', color: 'bg-red-100 text-red-800' },
  completed: { label: 'הושלם', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'בוטל', color: 'bg-gray-100 text-gray-800' }
};

const sendMethodLabels: Record<string, string> = {
  quick_generate: 'הפקה מהירה',
  email: 'מייל',
  whatsapp: 'וואטסאפ',
  fax: 'פקס',
  manual: 'ידני'
};

const processFilters = [
  { value: 'all', label: 'הצג הכל' },
  { value: 'fishing_policy', label: 'פישינג פוליסה' },
  { value: 'fishing_mislaka', label: 'פישינג מסלקה' },
  { value: 'power_of_attorney', label: 'יפוי כח' },
  { value: 'enrollment', label: 'הצטרפויות' },
  { value: 'material_action', label: 'פעולות בחומר' },
  { value: 'update_details', label: 'עדכון פרטי לקוח' },
];

const ProcessManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sendMethodFilter, setSendMethodFilter] = useState('all');
  const [controlFilter, setControlFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/agent/auth');
        return;
      }

      // Fetch processes with client info
      const { data, error } = await supabase
        .from('processes')
        .select(`
          *,
          clients:client_id (
            full_name,
            id_number
          )
        `)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processesWithClientInfo = (data || []).map(p => ({
        ...p,
        client_name: p.clients?.full_name,
        client_id_number: p.clients?.id_number
      }));

      setProcesses(processesWithClientInfo);
    } catch (error: any) {
      console.error('Error fetching processes:', error);
      toast({
        title: "שגיאה בטעינת נתונים",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את התהליך?')) return;

    try {
      const { error } = await supabase
        .from('processes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "נמחק בהצלחה" });
      fetchProcesses();
    } catch (error: any) {
      toast({
        title: "שגיאה במחיקה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProcesses.length === 0) return;
    if (!confirm(`האם למחוק ${selectedProcesses.length} תהליכים?`)) return;

    try {
      const { error } = await supabase
        .from('processes')
        .delete()
        .in('id', selectedProcesses);

      if (error) throw error;

      toast({ title: "נמחקו בהצלחה" });
      setSelectedProcesses([]);
      fetchProcesses();
    } catch (error: any) {
      toast({
        title: "שגיאה במחיקה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleExportExcel = () => {
    // Create CSV content
    const headers = ['שם לקוח', 'ת.ז', 'חברה', 'סוג', 'סטטוס', 'תאריך שליחה'];
    const rows = filteredProcesses.map(p => [
      p.client_name || '',
      p.client_id_number || '',
      p.company || '',
      processTypeLabels[p.process_type] || p.process_type,
      statusLabels[p.status]?.label || p.status,
      p.sent_at ? new Date(p.sent_at).toLocaleDateString('he-IL') : ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'processes.csv';
    a.click();

    toast({ title: "הקובץ הורד בהצלחה" });
  };

  const toggleProcessSelection = (id: string) => {
    setSelectedProcesses(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProcesses.length === filteredProcesses.length) {
      setSelectedProcesses([]);
    } else {
      setSelectedProcesses(filteredProcesses.map(p => p.id));
    }
  };

  const formatDate = (date?: string): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('he-IL');
  };

  // Filter processes
  const filteredProcesses = processes.filter(p => {
    if (activeFilter !== 'all' && p.process_type !== activeFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (sendMethodFilter !== 'all' && p.send_method !== sendMethodFilter) return false;
    if (controlFilter !== 'all' && p.control_status !== controlFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!p.client_name?.toLowerCase().includes(query) &&
          !p.client_id_number?.includes(query)) {
        return false;
      }
    }
    if (dateFrom && p.created_at < dateFrom) return false;
    if (dateTo && p.created_at > dateTo) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/20 p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/20 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold gradient-primary bg-clip-text text-transparent">
            ניהול תהליכים
          </h1>
          <p className="text-muted-foreground mt-1">
            מעקב אחר כל התהליכים והבקשות
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader className="pb-4">
            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs text-muted-foreground">חיפוש לקוח</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="שם לקוח או ת.ז..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>

              <div className="w-[140px]">
                <Label className="text-xs text-muted-foreground">סוג בקשה</Label>
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {processFilters.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[120px]">
                <Label className="text-xs text-muted-foreground">צורת שליחה</Label>
                <Select value={sendMethodFilter} onValueChange={setSendMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">הכל</SelectItem>
                    <SelectItem value="quick_generate">הפקה מהירה</SelectItem>
                    <SelectItem value="email">מייל</SelectItem>
                    <SelectItem value="whatsapp">וואטסאפ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[120px]">
                <Label className="text-xs text-muted-foreground">סטטוס</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">הכל</SelectItem>
                    {Object.entries(statusLabels).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[100px]">
                <Label className="text-xs text-muted-foreground">מיון</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">תאריך</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                >
                  <Download className="h-4 w-4 ml-2" />
                  Excel
                </Button>
                {selectedProcesses.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    מחק ({selectedProcesses.length})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Tabs */}
            <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-4">
              <TabsList className="h-8 flex-wrap">
                {processFilters.map(filter => (
                  <TabsTrigger key={filter.value} value={filter.value} className="text-xs px-2 h-7">
                    {filter.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Processes Table */}
            {filteredProcesses.length === 0 ? (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">לא נמצאו תהליכים</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedProcesses.length === filteredProcesses.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-right">שם לקוח</TableHead>
                      <TableHead className="text-right">ת.ז</TableHead>
                      <TableHead className="text-right">חברה</TableHead>
                      <TableHead className="text-right">סוג</TableHead>
                      <TableHead className="text-right">מסמכים</TableHead>
                      <TableHead className="text-right">צורת שליחה</TableHead>
                      <TableHead className="text-right">תאריך שליחה</TableHead>
                      <TableHead className="text-right">סטטוס</TableHead>
                      <TableHead className="text-right">מידע</TableHead>
                      <TableHead className="text-right">בקרה</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProcesses.map((process) => (
                      <TableRow key={process.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedProcesses.includes(process.id)}
                            onCheckedChange={() => toggleProcessSelection(process.id)}
                          />
                        </TableCell>
                        <TableCell
                          className="font-medium cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/agent/customer/${process.client_id}`)}
                        >
                          {process.client_name || '-'}
                        </TableCell>
                        <TableCell>{process.client_id_number || '-'}</TableCell>
                        <TableCell>{process.company || '-'}</TableCell>
                        <TableCell>
                          {processTypeLabels[process.process_type] || process.process_type}
                        </TableCell>
                        <TableCell>
                          {process.documents_sent?.length
                            ? `${process.documents_sent.length} מסמכים`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {sendMethodLabels[process.send_method || ''] || '-'}
                        </TableCell>
                        <TableCell>{formatDate(process.sent_at)}</TableCell>
                        <TableCell>
                          <Badge className={statusLabels[process.status]?.color || ''}>
                            {statusLabels[process.status]?.label || process.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {process.status_info ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">הצג</Button>
                              </PopoverTrigger>
                              <PopoverContent className="text-sm" dir="rtl">
                                {process.status_info}
                              </PopoverContent>
                            </Popover>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {process.control_status || '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(process.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                מציג {filteredProcesses.length} מתוך {processes.length} תהליכים
              </p>
              <div className="flex gap-1">
                {/* Simple pagination placeholder */}
                <Button variant="outline" size="sm" disabled>הקודם</Button>
                <Button variant="outline" size="sm">1</Button>
                <Button variant="outline" size="sm" disabled>הבא</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProcessManagement;
