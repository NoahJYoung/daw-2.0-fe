import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const SignupForm = () => {
  return (
    <form>
      <div className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Enter your name" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" placeholder="Enter your email" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            placeholder="Choose a secure password"
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="passwordConfirmation">Confirm Password</Label>
          <Input
            type="password"
            id="passwordConfirmation"
            placeholder="Reenter your password"
          />
        </div>
        <Button className="w-full" type="submit">
          Sign Up
        </Button>
      </div>
    </form>
  );
};
