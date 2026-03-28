import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { FileText, Image, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { hashPassword } from "../utils/auth";

const MAX_SIZE = 5 * 1024 * 1024;

interface UploadedFile {
  name: string;
  size: number;
}

export default function Register() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    dob: "",
    email: "",
    phone: "",
    pan: "",
    aadhaar: "",
    gst: "",
    companyName: "",
    experience: "",
    outlets: "",
    password: "",
    confirmPassword: "",
  });
  const [files, setFiles] = useState<{
    photo?: UploadedFile;
    signature?: UploadedFile;
    fssai?: UploadedFile;
    certificate?: UploadedFile;
  }>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const photoRef = useRef<HTMLInputElement>(null);
  const signRef = useRef<HTMLInputElement>(null);
  const fssaiRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileUpload =
    (field: keyof typeof files) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }
      setFiles((prev) => ({
        ...prev,
        [field]: { name: file.name, size: file.size },
      }));
      toast.success(`${file.name} uploaded successfully`);
    };

  const removeFile = (field: keyof typeof files) => {
    setFiles((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.dob) newErrors.dob = "Date of birth is required";
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/))
      newErrors.email = "Valid email required";
    if (!form.phone.match(/^[6-9]\d{9}$/))
      newErrors.phone = "Valid 10-digit phone required";
    if (!form.pan.match(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/))
      newErrors.pan = "Valid PAN format required (e.g. ABCDE1234F)";
    if (!form.aadhaar.match(/^\d{12}$/))
      newErrors.aadhaar = "Aadhaar must be 12 digits";
    if (
      !form.gst.match(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      )
    )
      newErrors.gst = "Valid GST number required";
    if (!form.companyName.trim())
      newErrors.companyName = "Company name is required";
    if (!form.experience.trim())
      newErrors.experience = "Experience is required";
    if (!form.outlets.trim()) newErrors.outlets = "Outlets count is required";
    if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!actor) {
      toast.error("Not connected. Please wait.");
      return;
    }
    setLoading(true);
    try {
      const passwordHash = await hashPassword(form.password);
      const res = await actor.register(
        form.name,
        form.email,
        form.phone,
        passwordHash,
        form.pan,
        form.aadhaar,
        form.gst,
        form.companyName,
        form.dob,
        form.experience,
        form.outlets,
      );
      if (res.__kind__ === "err") throw new Error(res.err);
      toast.success("Registration successful! Please login.");
      navigate({ to: "/login" });
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const FileUploadBox = ({
    label,
    field,
    icon: Icon,
    inputRef,
  }: {
    label: string;
    field: keyof typeof files;
    icon: React.ElementType;
    inputRef: React.RefObject<HTMLInputElement | null>;
  }) => {
    const uploaded = files[field];
    return (
      <div>
        <Label className="text-sm font-medium text-navy-900 mb-1 block">
          {label}
        </Label>
        {uploaded ? (
          <div className="flex items-center gap-2 p-3 border border-green-200 bg-green-50 rounded-lg">
            <Icon className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 truncate flex-1">
              {uploaded.name}
            </span>
            <span className="text-xs text-green-600">
              {(uploaded.size / 1024).toFixed(0)}KB
            </span>
            <button
              type="button"
              onClick={() => removeFile(field)}
              className="text-gray-400 hover:text-red-500"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="w-full border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-cobalt-600 hover:bg-blue-50 transition-colors"
            onClick={() => inputRef.current?.click()}
            data-ocid={`register.${field}.dropzone`}
          >
            <Icon className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">
              Click to upload{" "}
              <span className="text-cobalt-600 font-medium">{label}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Max 5MB</p>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload(field)}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-navy-900">
            Bidder Registration
          </h1>
          <p className="text-muted-foreground mt-2">
            Create your account to participate in the Genpact Tea Counter Tender
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-navy-900">Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  label: "Full Name",
                  name: "name",
                  type: "text",
                  placeholder: "As per government ID",
                },
                {
                  label: "Date of Birth",
                  name: "dob",
                  type: "date",
                  placeholder: "",
                },
                {
                  label: "Email Address",
                  name: "email",
                  type: "email",
                  placeholder: "business@example.com",
                },
                {
                  label: "Phone Number",
                  name: "phone",
                  type: "tel",
                  placeholder: "10-digit mobile",
                },
                {
                  label: "PAN Number",
                  name: "pan",
                  type: "text",
                  placeholder: "ABCDE1234F",
                },
                {
                  label: "Aadhaar Number",
                  name: "aadhaar",
                  type: "text",
                  placeholder: "12-digit Aadhaar",
                },
              ].map((field) => (
                <div key={field.name}>
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-medium text-navy-900"
                  >
                    {field.label}
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    className={`mt-1 ${errors[field.name] ? "border-red-400" : ""}`}
                    data-ocid={`register.${field.name}.input`}
                  />
                  {errors[field.name] && (
                    <p
                      className="text-xs text-red-500 mt-1"
                      data-ocid={`register.${field.name}_error`}
                    >
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-navy-900">Company Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  label: "Company Name",
                  name: "companyName",
                  placeholder: "Registered company name",
                },
                {
                  label: "GST Number",
                  name: "gst",
                  placeholder: "22AAAAA0000A1Z5",
                },
                {
                  label: "Years of Experience",
                  name: "experience",
                  placeholder: "e.g. 5",
                },
                {
                  label: "Number of Outlets",
                  name: "outlets",
                  placeholder: "e.g. 3",
                },
              ].map((field) => (
                <div key={field.name}>
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-medium text-navy-900"
                  >
                    {field.label}
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    className={`mt-1 ${errors[field.name] ? "border-red-400" : ""}`}
                    data-ocid={`register.${field.name}.input`}
                  />
                  {errors[field.name] && (
                    <p
                      className="text-xs text-red-500 mt-1"
                      data-ocid={`register.${field.name}_error`}
                    >
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-navy-900">Document Upload</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload clear scans/photos (max 5MB each)
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileUploadBox
                label="Passport Photo"
                field="photo"
                icon={Image}
                inputRef={photoRef}
              />
              <FileUploadBox
                label="Signature"
                field="signature"
                icon={Image}
                inputRef={signRef}
              />
              <FileUploadBox
                label="FSSAI Certificate"
                field="fssai"
                icon={FileText}
                inputRef={fssaiRef}
              />
              <FileUploadBox
                label="Business Certificate"
                field="certificate"
                icon={FileText}
                inputRef={certRef}
              />
            </CardContent>
          </Card>

          <Card className="shadow-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-navy-900">Set Password</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-navy-900"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  className={`mt-1 ${errors.password ? "border-red-400" : ""}`}
                  data-ocid="register.password.input"
                />
                {errors.password && (
                  <p
                    className="text-xs text-red-500 mt-1"
                    data-ocid="register.password_error"
                  >
                    {errors.password}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-navy-900"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`mt-1 ${errors.confirmPassword ? "border-red-400" : ""}`}
                  data-ocid="register.confirm_password.input"
                />
                {errors.confirmPassword && (
                  <p
                    className="text-xs text-red-500 mt-1"
                    data-ocid="register.confirm_password_error"
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-navy-900 hover:bg-navy-800 text-white h-12 text-base font-semibold rounded-lg"
            data-ocid="register.submit_button"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
              </>
            ) : (
              "Create Account & Register"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already registered?{" "}
            <Link
              to="/login"
              className="text-cobalt-600 font-medium hover:underline"
            >
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
