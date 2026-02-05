import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import LoginButton from './LoginButton';

export default function AuthStatusBar() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="flex items-center gap-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg">
      {isAuthenticated && (
        <div className="text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Signed in
        </div>
      )}
      <LoginButton />
    </div>
  );
}

