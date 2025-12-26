"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  User,
  ChevronDown,
  Users,
  Calendar,
  FileText,
  MessageCircle,
  Phone,
  Mail,
  Star,
  Copy,
  Edit,
  Send,
  FileSignature,
  ClipboardList,
  Clock,
  Building,
  Shield,
  Heart,
  Car,
  Home,
  Briefcase,
  Download,
  Eye,
  MoreVertical,
  Loader2,
  UserCog,
  Building2,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Customer,
  Product,
  Document as DocType,
  Activity,
  Meeting,
  Workflow,
  FamilyMember,
  Employer,
  Beneficiary,
  productTypeLabels,
  productStatusLabels,
  documentTypeLabels,
  activityTypeLabels,
  meetingTypeLabels,
  meetingStatusLabels,
  workflowStatusLabels,
  workflowPriorityLabels,
} from "@/types/database";
import {
  PersonalDetailsTab,
  AdditionalDetailsTab,
  FamilyMembersTab,
  EmployersTab,
  BeneficiariesTab,
} from "@/components/customers";

interface CustomerData extends Customer {
  products: Product[];
  documents: DocType[];
  activities: Activity[];
  meetings: Meeting[];
  workflows: Workflow[];
  family_members: FamilyMember[];
  employers: Employer[];
  beneficiaries: Beneficiary[];
  needs_assessment: Record<string, unknown> | null;
}

const productIcons: Record<string, typeof Building> = {
  pension: Building,
  provident: Building,
  study_fund: Building,
  managers: Briefcase,
  life: Heart,
  health: Shield,
  critical_illness: Shield,
  personal_accident: Shield,
  mortgage: Home,
  travel: Building,
  car: Car,
  home: Home,
  business: Briefcase,
};

function QualityStars({ score }: { score: number | null | undefined }) {
  const safeScore = score || 0;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= safeScore ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("he-IL");
}

function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CustomerDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("details");
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const response = await fetch(`/api/customers/${params.id}`);
        const result = await response.json();

        if (result.data) {
          setCustomer(result.data);
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
        toast.error("שגיאה בטעינת פרטי הלקוח");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchCustomer();
    }
  }, [params.id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} הועתק ללוח`);
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    if (customer) {
      setCustomer({ ...customer, ...updatedCustomer });
    }
  };

  const updateFamilyMembers = (members: FamilyMember[]) => {
    if (customer) {
      setCustomer({ ...customer, family_members: members });
    }
  };

  const updateEmployers = (employers: Employer[]) => {
    if (customer) {
      setCustomer({ ...customer, employers });
    }
  };

  const updateBeneficiaries = (beneficiaries: Beneficiary[]) => {
    if (customer) {
      setCustomer({ ...customer, beneficiaries });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">לקוח לא נמצא</p>
        <Link href="/customers">
          <Button className="mt-4">חזרה לרשימת הלקוחות</Button>
        </Link>
      </div>
    );
  }

  const fullName = `${customer.first_name} ${customer.last_name}`;
  const products = customer.products || [];
  const documents = customer.documents || [];
  const activities = customer.activities || [];
  const meetings = customer.meetings || [];
  const workflows = customer.workflows || [];
  const familyMembers = customer.family_members || [];
  const employers = customer.employers || [];
  const beneficiaries = customer.beneficiaries || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-white font-bold text-xl">
              {customer.first_name.charAt(0)}
              {customer.last_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{fullName}</h1>
              <p className="text-muted-foreground">ת.ז. {customer.id_number}</p>
            </div>
          </div>
        </div>
        <QualityStars score={customer.quality_score} />
      </div>

      {/* Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {/* Profile */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="פרטים מלאים">
                    <User className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>פרטי לקוח - {fullName}</DialogTitle>
                    <DialogDescription>מידע אישי ופרטי התקשרות</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">תאריך לידה</p>
                        <p className="font-medium">{formatDate(customer.birth_date)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">מין</p>
                        <p className="font-medium">{customer.gender || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">מצב משפחתי</p>
                        <p className="font-medium">{customer.marital_status || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">לקוח מאז</p>
                        <p className="font-medium">{formatDate(customer.created_at)}</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground mb-1">כתובת</p>
                      <p className="font-medium">
                        {customer.address_street || ""} {customer.address_number || ""}
                        {customer.address_city ? `, ${customer.address_city}` : ""}
                        {!customer.address_street && !customer.address_city && "-"}
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Quick Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    אני רוצה...
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem>
                    <FileSignature className="ml-2 h-4 w-4" />
                    בקשת ייפוי כוח מרחוק
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="ml-2 h-4 w-4" />
                    קבלת ייפוי כוח בפגישה
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Send className="ml-2 h-4 w-4" />
                    שליחת דוח ללקוח
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="ml-2 h-4 w-4" />
                    קביעת פגישה
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ClipboardList className="ml-2 h-4 w-4" />
                    הכנת סיכום פגישה
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <FileText className="ml-2 h-4 w-4" />
                    ביצוע הפקה ישירה
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" title="קשרים משפחתיים">
                <Users className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" title="הערות">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {customer.mobile && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-600"
                    title="WhatsApp"
                    onClick={() => {
                      window.open(
                        `https://wa.me/972${customer.mobile!.replace(/\D/g, "").slice(1)}`,
                        "_blank"
                      );
                    }}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="gap-2"
                    onClick={() => copyToClipboard(customer.mobile!, "מספר הטלפון")}
                  >
                    <Phone className="h-4 w-4" />
                    <span dir="ltr">{customer.mobile}</span>
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </>
              )}
              {customer.email && (
                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={() => window.location.href = `mailto:${customer.email}`}
                >
                  <Mail className="h-4 w-4" />
                  <span dir="ltr">{customer.email}</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-10 h-auto">
          <TabsTrigger value="details" className="flex items-center gap-1 text-xs">
            <User className="h-4 w-4" />
            פרטים
          </TabsTrigger>
          <TabsTrigger value="additional" className="flex items-center gap-1 text-xs">
            <UserCog className="h-4 w-4" />
            פרטים נוספים
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-1 text-xs">
            <Users className="h-4 w-4" />
            משפחה ({familyMembers.length})
          </TabsTrigger>
          <TabsTrigger value="employers" className="flex items-center gap-1 text-xs">
            <Building2 className="h-4 w-4" />
            מעסיקים ({employers.length})
          </TabsTrigger>
          <TabsTrigger value="beneficiaries" className="flex items-center gap-1 text-xs">
            <UserCheck className="h-4 w-4" />
            מוטבים ({beneficiaries.length})
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-1 text-xs">
            <Building className="h-4 w-4" />
            מוצרים ({products.length})
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-1 text-xs">
            <ClipboardList className="h-4 w-4" />
            תהליכים ({workflows.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-1 text-xs">
            <FileText className="h-4 w-4" />
            מסמכים ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-1 text-xs">
            <Calendar className="h-4 w-4" />
            פגישות ({meetings.length})
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-1 text-xs">
            <Clock className="h-4 w-4" />
            פעילויות
          </TabsTrigger>
        </TabsList>

        {/* Personal Details Tab */}
        <TabsContent value="details">
          <PersonalDetailsTab customer={customer} onUpdate={updateCustomer} />
        </TabsContent>

        {/* Additional Details Tab */}
        <TabsContent value="additional">
          <AdditionalDetailsTab customer={customer} onUpdate={updateCustomer} />
        </TabsContent>

        {/* Family Members Tab */}
        <TabsContent value="family">
          <FamilyMembersTab
            customerId={customer.id}
            familyMembers={familyMembers}
            onUpdate={updateFamilyMembers}
          />
        </TabsContent>

        {/* Employers Tab */}
        <TabsContent value="employers">
          <EmployersTab
            customerId={customer.id}
            employers={employers}
            onUpdate={updateEmployers}
          />
        </TabsContent>

        {/* Beneficiaries Tab */}
        <TabsContent value="beneficiaries">
          <BeneficiariesTab
            customerId={customer.id}
            beneficiaries={beneficiaries}
            products={products}
            onUpdate={updateBeneficiaries}
          />
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">מוצרים</h2>
            <Button className="bg-brand-blue hover:bg-brand-blue/90">
              הוסף מוצר
            </Button>
          </div>
          {products.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                אין מוצרים
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {products.map((product) => {
                const Icon = productIcons[product.type] || FileText;
                return (
                  <Card key={product.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue/10">
                            <Icon className="h-5 w-5 text-brand-blue" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {productTypeLabels[product.type]}
                            </CardTitle>
                            <CardDescription>{product.company || "-"}</CardDescription>
                          </div>
                        </div>
                        <Badge className={product.status === "active" ? "bg-brand-green" : ""}>
                          {productStatusLabels[product.status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">מספר פוליסה</p>
                          <p className="font-medium" dir="ltr">{product.policy_number || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">פרמיה חודשית</p>
                          <p className="font-medium">
                            {product.premium_monthly ? `${product.premium_monthly.toLocaleString()} ₪` : "-"}
                          </p>
                        </div>
                        {product.balance && (
                          <div>
                            <p className="text-muted-foreground">יתרה</p>
                            <p className="font-medium">{product.balance.toLocaleString()} ₪</p>
                          </div>
                        )}
                        {product.management_fee && (
                          <div>
                            <p className="text-muted-foreground">דמי ניהול</p>
                            <p className="font-medium">{product.management_fee}%</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">תהליכים</h2>
            <Button className="bg-brand-blue hover:bg-brand-blue/90">תהליך חדש</Button>
          </div>
          {workflows.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                אין תהליכים פתוחים
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{workflow.type}</p>
                        <p className="text-sm text-muted-foreground">
                          תאריך יעד: {formatDate(workflow.due_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{workflowPriorityLabels[workflow.priority]}</Badge>
                        <Badge>{workflowStatusLabels[workflow.status]}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">מסמכים</h2>
            <Button className="bg-brand-blue hover:bg-brand-blue/90">העלאת מסמך</Button>
          </div>
          {documents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                אין מסמכים
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue/10">
                          <FileText className="h-5 w-5 text-brand-blue" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {documentTypeLabels[doc.type]} • {formatDate(doc.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.viewed_at && (
                          <Badge variant="outline" className="gap-1">
                            <Eye className="h-3 w-3" />
                            נצפה
                          </Badge>
                        )}
                        {doc.sent_at && !doc.viewed_at && <Badge variant="secondary">נשלח</Badge>}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem>
                              <Download className="ml-2 h-4 w-4" />
                              הורדה
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="ml-2 h-4 w-4" />
                              שליחה ללקוח
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">פגישות</h2>
            <Button className="bg-brand-blue hover:bg-brand-blue/90">קביעת פגישה</Button>
          </div>
          {meetings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                אין פגישות
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {meetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatDateTime(meeting.scheduled_at)}
                      </CardTitle>
                      <Badge className={meeting.status === "completed" ? "bg-brand-green" : ""}>
                        {meetingStatusLabels[meeting.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">סוג: </span>
                        {meetingTypeLabels[meeting.type]}
                      </p>
                      <p>
                        <span className="text-muted-foreground">משך: </span>
                        {meeting.duration_minutes} דקות
                      </p>
                      {meeting.summary && (
                        <p className="text-muted-foreground">{meeting.summary}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <h2 className="text-xl font-semibold">פעילויות</h2>
          {activities.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                אין פעילויות
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {activity.type === "call" && <Phone className="h-5 w-5" />}
                        {activity.type === "document" && <FileText className="h-5 w-5" />}
                        {activity.type === "meeting" && <Calendar className="h-5 w-5" />}
                        {activity.type === "email" && <Mail className="h-5 w-5" />}
                        {activity.type === "whatsapp" && <MessageCircle className="h-5 w-5" />}
                        {activity.type === "note" && <Edit className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{activityTypeLabels[activity.type]}</Badge>
                        </div>
                        <p className="mt-1">{activity.description || "-"}</p>
                        <p className="text-sm text-muted-foreground">{formatDateTime(activity.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
