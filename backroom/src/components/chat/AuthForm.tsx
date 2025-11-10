import { LogIn, UserPlus } from 'lucide-react';
import { useCallback } from 'react';

type Props = {
  username: string;
  password: string;
  isRegister: boolean;
  loginError: boolean;
  registerError: boolean;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
  onToggleRegister: () => void;
  className?: string;
};

function CornerPlus() {
  return (
    <div className="relative w-3 h-3">
      <div className="absolute inset-y-0 left-1/2 w-px bg-white -translate-x-1/2" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-white -translate-y-1/2" />
    </div>
  );
}

export default function AuthForm({
  username,
  password,
  isRegister,
  loginError,
  registerError,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onToggleRegister,
  className,
}: Props) {
  const handleEnter = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') onSubmit();
    },
    [onSubmit]
  );

  return (
    <div className={className}>
      <div className="w-full max-w-sm mx-auto mb-6">
        <div className="bg-neutral-800 rounded-md p-3 text-xs text-neutral-300">
          <p>
            Give yourself a random name and set up a password. <br />
            Your details will be deleted from our server in <span className="text-violet-300 font-bold">4 hours</span>.
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm mx-auto space-y-3">
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
            Username
          </label>
          <input
            type="text"
            placeholder="enter username"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            onKeyDown={handleEnter}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-neutral-100 placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder="enter password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onKeyDown={handleEnter}
            className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-neutral-100 placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition"
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={!username.trim() || !password.trim()}
          className="w-full relative cursor-pointer bg-violet-300 hover:bg-violet-400 text-neutral-900 py-2.5 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        >
          {isRegister ? (
            <>
              <UserPlus className="w-4 h-4" />
              Register
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Login
            </>
          )}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
            <CornerPlus />
          </div>
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2">
            <CornerPlus />
          </div>
        </button>

        <div className="flex justify-center">
          {loginError && <p className="text-red-500 text-sm">Invalid username or password</p>}
          {registerError && <p className="text-red-500 text-sm">Username already exists</p>}
        </div>

        <div className="mt-1 text-center">
          <button
            onClick={onToggleRegister}
            className="text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer transition-all duration-500 delay-100 ease-in-out"
          >
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}


