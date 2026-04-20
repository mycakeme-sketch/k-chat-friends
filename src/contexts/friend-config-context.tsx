"use client";

import {
  dbRowsToConfig,
  type CharacterRow,
} from "@/lib/characters-map";
import { createClient } from "@/lib/supabase/browser-client";
import {
  getDefaultFriendConfig,
  type FriendConfigStorage,
} from "@/lib/friend-defaults";
import type { FriendProfile } from "@/types/chat";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PromptBundle = { system: string; hintStyle: string };

type Ctx = {
  ready: boolean;
  /** DB에 행이 하나라도 있으면 true (시드 여부 안내용) */
  hasDbRows: boolean;
  config: FriendConfigStorage;
  friends: FriendProfile[];
  getFriend: (id: string) => FriendProfile | undefined;
  getWelcome: (friendId: string) => string;
  getPromptBundle: (promptId: string) => PromptBundle;
  setConfig: (next: FriendConfigStorage | ((prev: FriendConfigStorage) => FriendConfigStorage)) => void;
  /** Supabase에서 다시 불러오기 */
  refresh: () => Promise<void>;
  /** 전체 config를 서버(Supabase)에 저장 — 모든 사용자에게 반영 */
  saveToServer: (adminSecret: string, configToSave: FriendConfigStorage) => Promise<void>;
  /** 코드 기본값(Noah/Yoon)을 DB에 삽입·갱신 */
  seedDefaultsToServer: (adminSecret: string) => Promise<void>;
};

const FriendConfigContext = createContext<Ctx | null>(null);

export function FriendConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<FriendConfigStorage>(() => getDefaultFriendConfig());
  const [ready, setReady] = useState(false);
  const [hasDbRows, setHasDbRows] = useState(false);

  /** DB → React state (초기 로드·저장 후·탭 복귀 시 동일 경로) */
  const loadFromDatabase = useCallback(async () => {
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from("characters")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      if (data?.length) {
        setConfigState(dbRowsToConfig(data as CharacterRow[]));
        setHasDbRows(true);
      } else {
        setConfigState(getDefaultFriendConfig());
        setHasDbRows(false);
      }
    } catch {
      setConfigState(getDefaultFriendConfig());
      setHasDbRows(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadFromDatabase();
  }, [loadFromDatabase]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await loadFromDatabase();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadFromDatabase]);

  /** 다른 탭에서 저장 후 돌아오거나, bfcache 복원 후에도 최신 characters 반영 */
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const scheduleReload = () => {
      if (document.visibilityState !== "visible") return;
      if (t) clearTimeout(t);
      t = setTimeout(() => void loadFromDatabase(), 200);
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) scheduleReload();
    };
    document.addEventListener("visibilitychange", scheduleReload);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", scheduleReload);
      window.removeEventListener("pageshow", onPageShow);
      if (t) clearTimeout(t);
    };
  }, [loadFromDatabase]);

  const setConfig = useCallback((next: FriendConfigStorage | ((prev: FriendConfigStorage) => FriendConfigStorage)) => {
    setConfigState(next);
  }, []);

  const saveToServer = useCallback(async (adminSecret: string, configToSave: FriendConfigStorage) => {
    const res = await fetch("/api/admin/characters/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminSecret.trim(),
      },
      body: JSON.stringify({ config: configToSave }),
    });
    const j = (await res.json()) as { error?: string };
    if (!res.ok) {
      let msg = j.error || "Save failed";
      if (res.status === 401) {
        msg =
          "Unauthorized — 입력한 비밀번호가 Vercel의 CHARACTER_ADMIN_SECRET과 일치하지 않습니다. (앞뒤 공백·대소문자·재배포 여부 확인)";
      } else if (res.status === 503) {
        msg =
          "서버에 CHARACTER_ADMIN_SECRET이 없습니다. Vercel Production(또는 사용 중인 환경)에 변수를 넣고 Redeploy 하세요.";
      } else if (res.status === 500 && msg.includes("SUPABASE_SERVICE_ROLE_KEY")) {
        msg = `${msg} — 캐릭터 저장은 서비스 롤 키가 필요합니다. Vercel에 SUPABASE_SERVICE_ROLE_KEY를 추가하고 재배포하세요.`;
      }
      throw new Error(msg);
    }
    await refresh();
  }, [refresh]);

  const seedDefaultsToServer = useCallback(async (adminSecret: string) => {
    const res = await fetch("/api/admin/characters/seed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminSecret.trim(),
      },
      body: JSON.stringify({}),
    });
    const j = (await res.json()) as { error?: string };
    if (!res.ok) {
      let msg = j.error || "Seed failed";
      if (res.status === 401) {
        msg =
          "Unauthorized — 입력한 비밀번호가 Vercel의 CHARACTER_ADMIN_SECRET과 일치하지 않습니다. (앞뒤 공백·대소문자·재배포 여부 확인)";
      } else if (res.status === 503) {
        msg =
          "서버에 CHARACTER_ADMIN_SECRET이 없습니다. Vercel Production(또는 사용 중인 환경)에 변수를 넣고 Redeploy 하세요.";
      } else if (res.status === 500 && msg.includes("SUPABASE_SERVICE_ROLE_KEY")) {
        msg = `${msg} — Vercel에 SUPABASE_SERVICE_ROLE_KEY를 추가하고 재배포하세요.`;
      }
      throw new Error(msg);
    }
    await refresh();
  }, [refresh]);

  const friends = config.friends;

  const getFriend = useCallback(
    (id: string) => config.friends.find((f) => f.id === id),
    [config.friends],
  );

  const defaults = useMemo(() => getDefaultFriendConfig(), []);

  const getWelcome = useCallback(
    (friendId: string) =>
      config.welcomeById[friendId] ?? defaults.welcomeById[friendId] ?? "안녕하세요!",
    [config.welcomeById, defaults.welcomeById],
  );

  const getPromptBundle = useCallback(
    (promptId: string): PromptBundle => {
      const o = config.promptsByPromptId[promptId];
      if (o?.system && o?.hintStyle) return o;
      const d = defaults.promptsByPromptId[promptId];
      if (d?.system && d?.hintStyle) return d;
      return { system: "(empty system prompt)", hintStyle: "(empty hint style)" };
    },
    [config.promptsByPromptId, defaults.promptsByPromptId],
  );

  const value = useMemo(
    () => ({
      ready,
      hasDbRows,
      config,
      friends,
      getFriend,
      getWelcome,
      getPromptBundle,
      setConfig,
      refresh,
      saveToServer,
      seedDefaultsToServer,
    }),
    [
      ready,
      hasDbRows,
      config,
      friends,
      getFriend,
      getWelcome,
      getPromptBundle,
      setConfig,
      refresh,
      saveToServer,
      seedDefaultsToServer,
    ],
  );

  return <FriendConfigContext.Provider value={value}>{children}</FriendConfigContext.Provider>;
}

export function useFriendConfig(): Ctx {
  const c = useContext(FriendConfigContext);
  if (!c) throw new Error("useFriendConfig must be used within FriendConfigProvider");
  return c;
}
