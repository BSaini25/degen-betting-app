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
        <img height='30px' width='30px' src={session.user.image} />
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
      padding: '15px 25px',
      backgroundColor: '#007bff',
      color: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontWeight: 'bold',
    }}>
      {component}
    </div>
  );
}
