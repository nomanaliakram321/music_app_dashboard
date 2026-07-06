import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";

import { useNavigate } from "react-router-dom";

const ContactUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardContent className="pt-10 pb-10 flex flex-col items-center text-center space-y-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Contact Us</h1>
            <p className="text-muted-foreground">
              Have a question or feedback? Reach out to us and we'll get back to you as soon as
              possible.
            </p>
            <a
              href="https://mail.google.com/mail/?view=cm&to=MousikeChron@gmail.com"
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-4 w-4" />
              MousikeChron@gmail.com
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactUs;
