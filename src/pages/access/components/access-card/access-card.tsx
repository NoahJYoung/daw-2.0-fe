import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ContinueWithGoogle, LoginForm, SignupForm } from "./components";
import { useState } from "react";

export const AccessCard = () => {
  const [isLogIn, setIsLogIn] = useState(true);

  const getDescription = () =>
    isLogIn ? "Don't have an account yet?" : "Already have an account?";

  const getButtonText = () => (isLogIn ? "Sign Up" : "Login");

  const toggleFormMode = () => setIsLogIn((prev) => !prev);
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{isLogIn ? "Login" : "Sign Up"}</CardTitle>
        <CardDescription>
          <span className="flex items-center">
            <p>{getDescription()}</p>
            <Button variant="link" onClick={toggleFormMode}>
              {getButtonText()}
            </Button>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>{isLogIn ? <LoginForm /> : <SignupForm />}</CardContent>
      <hr className="border-t border-surface-2 mx-6 mb-4" />
      <CardFooter className="w-full">
        <span className="flex-shrink-0 w-full ">
          <ContinueWithGoogle />
        </span>
      </CardFooter>
    </Card>
  );
};
