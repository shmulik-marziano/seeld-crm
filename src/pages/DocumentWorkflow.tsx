import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  PenTool,
  Send,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  DocumentStatus,
  DocumentStatusType,
  WorkflowTimeline,
} from "@/components/workflow/DocumentStatus";
import {
  SignatureRequestCard,
  SignatureRequestData,
  SignatureStatusSummary,
  NewSignatureRequest,
} from "@/components/workflow/SignatureRequest";
import {
  SendToCompanyCard,
  CompanySubmission,
  CompanySubmissionSummary,
  NewSendToCompany,
} from "@/components/workflow/SendToCompany";

// Mock data for documents
interface Document {
  id: string;
  name: string;
  type: string;
  clientName: string;
  clientId: string;
  status: DocumentStatusType;
  createdAt: Date;
  updatedAt: Date;
  signatureRequest?: SignatureRequestData;
  companySubmission?: CompanySubmission;
}

const mockDocuments: Document[] = [
  {
    id: "doc-1",
    name: "טופס הצטרפות לקרן פנסיה",
    type: "הצטרפות",
    clientName: "ישראל ישראלי",
    clientId: "client-1",
    status: "pending_signature",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-16"),
    signatureRequest: {
      id: "sig-1",
      documentName: "טופס הצטרפות לקרן פנסיה",
      documentType: "הצטרפות",
      recipientName: "ישראל ישראלי",
      recipientEmail: "israel@example.com",
      recipientPhone: "050-1234567",
      status: "pending_signature",
      createdAt: new Date("2024-01-16"),
      sentAt: new Date("2024-01-16"),
      expiresAt: new Date("2024-01-23"),
      signatureMethod: "email",
      remindersSent: 1,
    },
  },
  {
    id: "doc-2",
    name: "טופס ניוד קרן פנסיה",
    type: "ניוד",
    clientName: "שרה כהן",
    clientId: "client-2",
    status: "signed",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-14"),
    signatureRequest: {
      id: "sig-2",
      documentName: "טופס ניוד קרן פנסיה",
      documentType: "ניוד",
      recipientName: "שרה כהן",
      recipientEmail: "sara@example.com",
      status: "signed",
      createdAt: new Date("2024-01-10"),
      sentAt: new Date("2024-01-10"),
      signedAt: new Date("2024-01-14"),
      signatureMethod: "email",
    },
  },
  {
    id: "doc-3",
    name: "בקשה לשינוי מוטבים",
    type: "שינוי",
    clientName: "דוד לוי",
    clientId: "client-3",
    status: "sent",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-15"),
    companySubmission: {
      id: "sub-1",
      documentName: "בקשה לשינוי מוטבים",
      documentType: "שינוי",
      companyId: "migdal",
      companyName: "מגדל",
      status: "processing",
      submittedAt: new Date("2024-01-15"),
      method: "api",
      referenceNumber: "MIG-2024-1234",
    },
  },
  {
    id: "doc-4",
    name: "טופס הצטרפות לביטוח בריאות",
    type: "הצטרפות",
    clientName: "רחל אברהם",
    clientId: "client-4",
    status: "approved",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-12"),
    companySubmission: {
      id: "sub-2",
      documentName: "טופס הצטרפות לביטוח בריאות",
      documentType: "הצטרפות",
      companyId: "harel",
      companyName: "הראל",
      status: "approved",
      submittedAt: new Date("2024-01-08"),
      processedAt: new Date("2024-01-12"),
      method: "portal",
      referenceNumber: "HAR-2024-5678",
    },
  },
  {
    id: "doc-5",
    name: "טופס ביטול פוליסה",
    type: "ביטול",
    clientName: "יעקב שמעון",
    clientId: "client-5",
    status: "rejected",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-10"),
    companySubmission: {
      id: "sub-3",
      documentName: "טופס ביטול פוליסה",
      documentType: "ביטול",
      companyId: "clal",
      companyName: "כלל",
      status: "rejected",
      submittedAt: new Date("2024-01-05"),
      processedAt: new Date("2024-01-10"),
      method: "email",
      notes: "חסרה חתימת המבוטח על העמוד האחרון",
    },
  },
];

const mockSignatureRequests: SignatureRequestData[] = mockDocuments
  .filter((d) => d.signatureRequest)
  .map((d) => d.signatureRequest!);

const mockCompanySubmissions: CompanySubmission[] = mockDocuments
  .filter((d) => d.companySubmission)
  .map((d) => d.companySubmission!);

const DocumentWorkflow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter documents
  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.includes(searchQuery) ||
      doc.clientName.includes(searchQuery) ||
      doc.type.includes(searchQuery);

    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const pendingSignature = mockDocuments.filter(
    (d) => d.status === "pending_signature"
  ).length;
  const awaitingCompany = mockDocuments.filter(
    (d) => d.status === "sent" || d.status === "processing"
  ).length;
  const completedToday = mockDocuments.filter(
    (d) =>
      d.status === "approved" &&
      d.updatedAt.toDateString() === new Date().toDateString()
  ).length;

  const handleResendSignature = (docId: string) => {
    toast({
      title: "בקשת חתימה נשלחה מחדש",
      description: "הלקוח יקבל הודעה חדשה",
    });
  };

  const handleRetrySubmission = (docId: string) => {
    toast({
      title: "המסמך נשלח מחדש לחברה",
      description: "תעודכן כשיתקבל אישור",
    });
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
            <h1 className="text-2xl font-bold text-crm-text-primary">
              ניהול מסמכים ותהליכים
            </h1>
            <p className="text-sm text-crm-text-secondary">
              מעקב אחר חתימות, שליחות לחברות ואישורים
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <NewSignatureRequest
            onSubmit={(data) => {
              toast({
                title: "בקשת חתימה נוצרה",
                description: `נשלחה ב${data.method === "email" ? "אימייל" : data.method === "sms" ? "SMS" : "קישור"}`,
              });
            }}
            trigger={
              <Button variant="outline" className="gap-2">
                <PenTool className="h-4 w-4" />
                בקש חתימה
              </Button>
            }
          />
          <NewSendToCompany
            onSubmit={(data) => {
              toast({
                title: "המסמך נשלח לחברה",
                description: "תעודכן כשיתקבל אישור",
              });
            }}
            trigger={
              <Button className="gap-2">
                <Send className="h-4 w-4" />
                שלח לחברה
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-crm-warning-light to-white border-crm-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-crm-warning/20 flex items-center justify-center">
                <PenTool className="h-6 w-6 text-crm-warning-dark" />
              </div>
              <div>
                <p className="text-2xl font-bold text-crm-warning-dark">
                  {pendingSignature}
                </p>
                <p className="text-sm text-crm-text-secondary">ממתינים לחתימה</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-crm-info-light to-white border-crm-info">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-crm-info/20 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-crm-info-dark" />
              </div>
              <div>
                <p className="text-2xl font-bold text-crm-info-dark">
                  {awaitingCompany}
                </p>
                <p className="text-sm text-crm-text-secondary">בטיפול בחברות</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-crm-success-light to-white border-crm-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-crm-success/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-crm-success-dark" />
              </div>
              <div>
                <p className="text-2xl font-bold text-crm-success-dark">
                  {mockDocuments.filter((d) => d.status === "approved").length}
                </p>
                <p className="text-sm text-crm-text-secondary">אושרו</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-crm-error-light to-white border-crm-error">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-crm-error/20 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-crm-error-dark" />
              </div>
              <div>
                <p className="text-2xl font-bold text-crm-error-dark">
                  {mockDocuments.filter((d) => d.status === "rejected").length}
                </p>
                <p className="text-sm text-crm-text-secondary">נדחו / דורשים טיפול</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <FileText className="h-4 w-4" />
              כל המסמכים
            </TabsTrigger>
            <TabsTrigger value="signatures" className="gap-2">
              <PenTool className="h-4 w-4" />
              חתימות
            </TabsTrigger>
            <TabsTrigger value="companies" className="gap-2">
              <Building2 className="h-4 w-4" />
              שליחות לחברות
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-crm-text-muted" />
              <Input
                placeholder="חיפוש..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pr-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="סוג" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסוגים</SelectItem>
                <SelectItem value="הצטרפות">הצטרפות</SelectItem>
                <SelectItem value="ניוד">ניוד</SelectItem>
                <SelectItem value="שינוי">שינוי</SelectItem>
                <SelectItem value="ביטול">ביטול</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="draft">טיוטה</SelectItem>
                <SelectItem value="pending_signature">ממתין לחתימה</SelectItem>
                <SelectItem value="signed">נחתם</SelectItem>
                <SelectItem value="sent">נשלח לחברה</SelectItem>
                <SelectItem value="processing">בטיפול</SelectItem>
                <SelectItem value="approved">אושר</SelectItem>
                <SelectItem value="rejected">נדחה</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* All Documents Tab */}
        <TabsContent value="all" className="space-y-4">
          {filteredDocuments.map((doc) => (
            <Card
              key={doc.id}
              className="hover:shadow-card-hover transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-crm-primary" />
                      <h4 className="font-semibold text-crm-text-primary">
                        {doc.name}
                      </h4>
                      <Badge variant="outline">{doc.type}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-crm-text-secondary">
                      <span>לקוח: {doc.clientName}</span>
                      <span>
                        נוצר: {doc.createdAt.toLocaleDateString("he-IL")}
                      </span>
                      <span>
                        עודכן: {doc.updatedAt.toLocaleDateString("he-IL")}
                      </span>
                    </div>

                    {/* Workflow Timeline Mini */}
                    <div className="flex items-center gap-2 mt-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          doc.status !== "draft"
                            ? "bg-crm-success text-white"
                            : "bg-crm-bg-hover"
                        }`}
                      >
                        <FileText className="h-3 w-3" />
                      </div>
                      <div className="w-8 h-0.5 bg-crm-border" />
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          doc.status === "signed" ||
                          doc.status === "sent" ||
                          doc.status === "processing" ||
                          doc.status === "approved"
                            ? "bg-crm-success text-white"
                            : doc.status === "pending_signature"
                            ? "bg-crm-warning text-white"
                            : "bg-crm-bg-hover"
                        }`}
                      >
                        <PenTool className="h-3 w-3" />
                      </div>
                      <div className="w-8 h-0.5 bg-crm-border" />
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          doc.status === "approved"
                            ? "bg-crm-success text-white"
                            : doc.status === "sent" || doc.status === "processing"
                            ? "bg-crm-info text-white"
                            : doc.status === "rejected"
                            ? "bg-crm-error text-white"
                            : "bg-crm-bg-hover"
                        }`}
                      >
                        <Send className="h-3 w-3" />
                      </div>
                      <div className="w-8 h-0.5 bg-crm-border" />
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          doc.status === "approved"
                            ? "bg-crm-success text-white"
                            : "bg-crm-bg-hover"
                        }`}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <DocumentStatus status={doc.status} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 ml-2" />
                          צפייה במסמך
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 ml-2" />
                          הורדה
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {doc.status === "pending_signature" && (
                          <DropdownMenuItem
                            onClick={() => handleResendSignature(doc.id)}
                          >
                            <RefreshCw className="h-4 w-4 ml-2" />
                            שלח תזכורת
                          </DropdownMenuItem>
                        )}
                        {doc.status === "signed" && (
                          <DropdownMenuItem>
                            <Send className="h-4 w-4 ml-2" />
                            שלח לחברה
                          </DropdownMenuItem>
                        )}
                        {doc.status === "rejected" && (
                          <DropdownMenuItem
                            onClick={() => handleRetrySubmission(doc.id)}
                          >
                            <RefreshCw className="h-4 w-4 ml-2" />
                            שלח מחדש
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-crm-error">
                          <Trash2 className="h-4 w-4 ml-2" />
                          מחק
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredDocuments.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-crm-text-muted mb-4" />
                <h3 className="text-lg font-semibold text-crm-text-primary mb-2">
                  לא נמצאו מסמכים
                </h3>
                <p className="text-crm-text-secondary">
                  נסה לשנות את מסנני החיפוש
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Signatures Tab */}
        <TabsContent value="signatures" className="space-y-4">
          <SignatureStatusSummary requests={mockSignatureRequests} />

          <div className="space-y-4">
            {mockSignatureRequests.map((request) => (
              <SignatureRequestCard
                key={request.id}
                request={request}
                onResend={() => handleResendSignature(request.id)}
                onViewDocument={() => {}}
                onCancel={() => {
                  toast({
                    title: "בקשת החתימה בוטלה",
                    variant: "destructive",
                  });
                }}
              />
            ))}
          </div>
        </TabsContent>

        {/* Company Submissions Tab */}
        <TabsContent value="companies" className="space-y-4">
          <CompanySubmissionSummary submissions={mockCompanySubmissions} />

          <div className="space-y-4">
            {mockCompanySubmissions.map((submission) => (
              <SendToCompanyCard
                key={submission.id}
                submission={submission}
                onRetry={() => handleRetrySubmission(submission.id)}
                onViewDocument={() => {}}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Workflow Timeline Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">דוגמה לתהליך עבודה</CardTitle>
          <CardDescription>מעקב אחר שלבי הטיפול במסמך</CardDescription>
        </CardHeader>
        <CardContent>
          <WorkflowTimeline
            steps={[
              {
                status: "draft",
                label: "יצירת מסמך",
                date: new Date("2024-01-15"),
                description: "המסמך נוצר במערכת",
                isCompleted: true,
              },
              {
                status: "pending_signature",
                label: "חתימת לקוח",
                date: new Date("2024-01-16"),
                description: "נשלחה בקשת חתימה ללקוח באימייל",
                isCompleted: true,
              },
              {
                status: "signed",
                label: "המסמך נחתם",
                date: new Date("2024-01-18"),
                description: "הלקוח חתם על המסמך דיגיטלית",
                isCompleted: true,
              },
              {
                status: "sent",
                label: "נשלח לחברה",
                date: new Date("2024-01-18"),
                description: "המסמך נשלח למגדל דרך API",
                isActive: true,
              },
              {
                status: "approved",
                label: "אישור סופי",
                description: "ממתין לאישור מהחברה",
                isCompleted: false,
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentWorkflow;
