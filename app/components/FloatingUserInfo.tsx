import { getServerSession } from "next-auth";
import { handler } from "../api/auth/[...nextauth]/route"
import {Session} from "next-auth";
import "./FloatingUserInfo.css";

export default async () => {
  const session: Session | null = await getServerSession(handler)
  let component;

  if (session) {
    component = (
      <div className="user-info-content">
        {session?.user?.image && (
          <img 
            className="user-avatar" 
            src={session.user.image} 
            alt="User avatar"
          />
        )}
        <span className="user-name">{session?.user?.name}</span>
      </div>
    );
  } else {
    component = <a href="/api/auth/signin" className="sign-in-link">Sign in</a>;
  }

  return (
    <div className="floating-user-info">
      {component}
    </div>
  );
}
