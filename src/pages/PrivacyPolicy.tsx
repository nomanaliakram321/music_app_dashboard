import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    title: "1. Information We Collect",
    content: (
      <>
        <p className="mb-3 text-muted-foreground">
          We prioritize your privacy by minimizing data collection. We do not require you to create
          an account or provide a name or email address to use the Services.
        </p>
        <ul className="space-y-3">
          <li>
            <span className="font-medium text-foreground">Anonymized Usage Data:</span>{" "}
            <span className="text-muted-foreground">
              We automatically collect high-level, anonymized information such as your device type,
              operating system, and general region (e.g., City/State) to improve app performance.
            </span>
          </li>
          <li>
            <span className="font-medium text-foreground">Anonymous Device Tokens:</span>{" "}
            <span className="text-muted-foreground">
              If you opt-in to push notifications, we collect an anonymous device token. This token
              is used solely for message delivery and is not linked to your personal identity.
            </span>
          </li>
          <li>
            <span className="font-medium text-foreground">Local Storage (Favorites):</span>{" "}
            <span className="text-muted-foreground">
              Your "Favorite" albums or artists are stored locally on your device. This data is not
              transmitted to our servers or shared with third parties.
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "2. How We Use Information",
    content: (
      <>
        <p className="mb-3 text-muted-foreground">We use anonymized data to:</p>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
          <li>Monitor app stability and fix technical errors.</li>
          <li>Analyze which music links are most popular to improve our curation.</li>
          <li>Send artist-specific alerts via anonymous push notifications (if enabled).</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Third-Party Links & Services",
    content: (
      <>
        <p className="mb-3 text-muted-foreground">
          Our Services contain deep links to third-party music platforms including Spotify and Apple
          Music.
        </p>
        <ul className="space-y-3">
          <li>
            <span className="font-medium text-foreground">No Data Access:</span>{" "}
            <span className="text-muted-foreground">
              We do not see or store your login credentials for these services.
            </span>
          </li>
          <li>
            <span className="font-medium text-foreground">Third-Party Policies:</span>{" "}
            <span className="text-muted-foreground">
              When you click a link, you are subject to the privacy policies of that platform. These
              platforms may use cookies to track clicks for affiliate commissions.
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "4. Data Retention & Deletion",
    content: (
      <ul className="space-y-3">
        <li>
          <span className="font-medium text-foreground">Local Data:</span>{" "}
          <span className="text-muted-foreground">
            You can delete your "Favorites" at any time by clearing the app's cache or uninstalling
            the application.
          </span>
        </li>
        <li>
          <span className="font-medium text-foreground">Anonymous Tokens:</span>{" "}
          <span className="text-muted-foreground">
            If you uninstall the app, your anonymous notification token is automatically invalidated
            and purged from our delivery system.
          </span>
        </li>
      </ul>
    ),
  },
  {
    title: "5. Contact Us",
    content: (
      <p className="text-muted-foreground">
        For questions about this policy, please contact{" "}
        <a
          href="https://mail.google.com/mail/?view=cm&to=MousikeChron@gmail.com"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline hover:text-primary/80"
        >
          MousikeChron@gmail.com
        </a>
        .
      </p>
    ),
  },
];

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="flex min-h-screen items-start justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-3xl space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="space-y-2 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Effective Date: March 17, 2026</p>
          <p className="text-muted-foreground">
            Mousike Chron, LLC (doing business as{" "}
            <span className="font-medium text-foreground">Hip Hop Calendar</span>) ("Company," "we,"
            or "us") provides deep links and music metadata through the Hip Hop Calendar mobile
            application (the "Services"). This policy explains how we handle information when you
            use our Services.
          </p>
        </div>

        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>{section.content}</CardContent>
          </Card>
        ))}

        <div className="flex justify-center">
          <img
            src="/hiphop-pvc-img.jpg"
            alt="Hip Hop Calendar app preview"
            className="h-auto w-full max-w-[320px] rounded-lg border bg-card object-contain shadow-sm sm:max-w-[360px]"
          />
        </div>

        <p className="pb-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Mousike Chron, LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
