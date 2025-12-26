import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FileSpreadsheet,
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileUploadZone } from "@/components/import/FileUploadZone";
import { DataPreviewTable } from "@/components/import/DataPreviewTable";

interface ImportSource {
  id: string;
  name: string;
  nameHebrew: string;
  description: string;
  icon: React.ReactNode;
  formats: string[];
  color: string;
}

const importSources: ImportSource[] = [
  {
    id: "har_habituach",
    name: "Har Habituach",
    nameHebrew: "הר הביטוח",
    description: "ייבוא נתונים מדוח הר הביטוח",
    icon: <Database className="h-6 w-6" />,
    formats: [".xlsx", ".csv"],
    color: "bg-blue-500",
  },
  {
    id: "mislaka",
    name: "Mislaka",
    nameHebrew: "מסלקה",
    description: "ייבוא נתונים מקבצי מסלקה",
    icon: <FileSpreadsheet className="h-6 w-6" />,
    formats: [".xlsx", ".xls"],
    color: "bg-green-500",
  },
];

// Mock preview columns
const previewColumns = [
  { key: "name", label: "שם לקוח", type: "text" as const },
  { key: "id_number", label: "ת.ז", type: "text" as const },
  { key: "company", label: "חברה", type: "text" as const },
  { key: "product_type", label: "סוג מוצר", type: "text" as const },
  { key: "accumulated", label: "צבירה", type: "currency" as const },
  { key: "monthly", label: "הפקדה חודשית", type: "currency" as const },
];

// Mock preview data
const mockPreviewData = [
  {
    id: "1",
    data: {
      name: "ישראל ישראלי",
      id_number: "123456789",
      company: "מגדל",
      product_type: "קרן פנסיה",
      accumulated: 450000,
      monthly: 2500,
    },
    status: "valid" as const,
  },
  {
    id: "2",
    data: {
      name: "שרה כהן",
      id_number: "987654321",
      company: "הראל",
      product_type: "קופת גמל",
      accumulated: 180000,
      monthly: 1500,
    },
    status: "valid" as const,
  },
  {
    id: "3",
    data: {
      name: "דוד לוי",
      id_number: "invalid",
      company: "כלל",
      product_type: "קרן השתלמות",
      accumulated: 220000,
      monthly: 1000,
    },
    status: "warning" as const,
    errors: ["תעודת זהות לא תקינה"],
  },
];

const DataImport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<typeof mockPreviewData | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
    toast({
      title: `${files.length} קבצים נבחרו`,
      description: "לחץ על 'עיבוד קבצים' להמשך",
    });
  };

  const handleProcess = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "לא נבחרו קבצים",
        description: "יש לבחור קבצים לייבוא",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setPreviewData(mockPreviewData);
    setIsProcessing(false);

    toast({
      title: "הקבצים עובדו בהצלחה",
      description: "בדוק את התצוגה המקדימה ואשר את הייבוא",
    });
  };

  const handleImport = async () => {
    if (!previewData || selectedRows.length === 0) {
      toast({
        title: "לא נבחרו שורות",
        description: "יש לבחור שורות לייבוא",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate import
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsProcessing(false);

    toast({
      title: "הייבוא הושלם בהצלחה",
      description: `${selectedRows.length} רשומות יובאו למערכת`,
    });

    // Reset state
    setPreviewData(null);
    setUploadedFiles([]);
    setSelectedRows([]);
    setActiveSource(null);
  };

  const handleReset = () => {
    setPreviewData(null);
    setUploadedFiles([]);
    setSelectedRows([]);
  };

  return (
    <div className="min-h-screen bg-crm-bg-secondary p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/agent/command-center")}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            חזרה
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-crm-text-primary">ייבוא נתונים</h1>
            <p className="text-sm text-crm-text-secondary">
              ייבוא מידע מהר הביטוח ומסלקה
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
            הורד תבנית
          </Button>
        </div>
      </div>

      {!activeSource ? (
        /* Source Selection */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <h2 className="col-span-full text-lg font-semibold text-crm-text-primary mb-2">
            בחר מקור נתונים
          </h2>
          {importSources.map((source) => (
            <Card
              key={source.id}
              className="cursor-pointer hover:shadow-card-hover hover:-translate-y-1 transition-all"
              onClick={() => setActiveSource(source.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${source.color} text-white flex items-center justify-center`}
                  >
                    {source.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-crm-text-primary">
                      {source.nameHebrew}
                    </h3>
                    <p className="text-sm text-crm-text-secondary mt-1">
                      {source.description}
                    </p>
                    <div className="flex gap-2 mt-3">
                      {source.formats.map((format) => (
                        <Badge key={format} variant="secondary">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Upload & Preview */
        <div className="space-y-6">
          {/* Source indicator */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg ${
                      importSources.find((s) => s.id === activeSource)?.color
                    } text-white flex items-center justify-center`}
                  >
                    {importSources.find((s) => s.id === activeSource)?.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {importSources.find((s) => s.id === activeSource)?.nameHebrew}
                    </h3>
                    <p className="text-sm text-crm-text-secondary">
                      {importSources.find((s) => s.id === activeSource)?.description}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setActiveSource(null)}>
                  שנה מקור
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload Zone */}
          {!previewData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  העלאת קבצים
                </CardTitle>
                <CardDescription>
                  גרור קבצים או לחץ לבחירה
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadZone
                  accept=".xlsx,.xls,.csv"
                  multiple={true}
                  maxFiles={5}
                  maxSize={10}
                  onFilesSelected={handleFilesSelected}
                />

                {uploadedFiles.length > 0 && (
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleProcess} disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          מעבד...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 ml-2" />
                          עיבוד קבצים
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Preview Table */}
          {previewData && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        תצוגה מקדימה
                      </CardTitle>
                      <CardDescription>
                        בדוק את הנתונים לפני הייבוא
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={handleReset}>
                      <RefreshCw className="h-4 w-4 ml-2" />
                      התחל מחדש
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataPreviewTable
                    columns={previewColumns}
                    data={previewData}
                    title="נתונים לייבוא"
                    pageSize={10}
                    selectable={true}
                    onSelectionChange={setSelectedRows}
                  />
                </CardContent>
              </Card>

              {/* Import Actions */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-crm-success" />
                        <span className="text-sm">
                          {previewData.filter((r) => r.status === "valid").length} תקינים
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-crm-warning" />
                        <span className="text-sm">
                          {previewData.filter((r) => r.status === "warning").length} אזהרות
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleReset}>
                        ביטול
                      </Button>
                      <Button
                        onClick={handleImport}
                        disabled={isProcessing || selectedRows.length === 0}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                            מייבא...
                          </>
                        ) : (
                          <>
                            <Database className="h-4 w-4 ml-2" />
                            ייבא {selectedRows.length} רשומות
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <Card className="mt-8 max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">מידע שימושי</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">הר הביטוח</h4>
              <ul className="space-y-1 text-sm text-crm-text-secondary">
                <li>• היכנס לאתר הר הביטוח</li>
                <li>• בחר "ייצוא נתונים"</li>
                <li>• הורד את הקובץ בפורמט Excel</li>
                <li>• העלה את הקובץ למערכת</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">מסלקה</h4>
              <ul className="space-y-1 text-sm text-crm-text-secondary">
                <li>• היכנס לממשק המסלקה</li>
                <li>• הפק דוח לקוחות</li>
                <li>• בחר פורמט Excel</li>
                <li>• העלה את הקובץ למערכת</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataImport;
