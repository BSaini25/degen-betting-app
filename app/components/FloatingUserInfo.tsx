import { getServerSession } from "next-auth";
import { handler } from "../api/auth/[...nextauth]/route"

export default async () => {
  const session = await getServerSession(handler)
  let component;

  if (session) {
    component = (
      <div style={{
        display: 'flex',
        alignItems: 'center',
      }}>
        <img height='30px' width='30px' style={{borderRadius: '9999px'}} src={session.user.image} />
        <p style={{paddingLeft: 15}}>{session.user.name}</p>
      </div>
    );
  } else {
    component = <a href="/api/auth/signin">Sign in</a>;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      padding: '10px 20px',
      backgroundColor: '#7f5af0',
      color: '#fff',
      borderRadius: '9999px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontWeight: 'bold',
    }}>
      {component}
    </div>
  );
}
