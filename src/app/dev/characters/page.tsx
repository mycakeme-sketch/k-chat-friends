"use client";

import { useFriendConfig } from "@/contexts/friend-config-context";
import { getDefaultFriendConfig } from "@/lib/friend-defaults";
import type { FriendProfile, FriendSlide } from "@/types/chat";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const ADMIN_SESSION_KEY = "kchat-admin-secret";

function emptySlide(): FriendSlide {
  return {
    src: "https://picsum.photos/seed/slide/720/1280",
    alt: "",
    caption: "",
    baseLikes: 1000,
  };
}

function newFriend(): FriendProfile {
  const id = `char-${Date.now()}`;
  return {
    id,
    name: "New character",
    tagline: "한 줄 소개",
    avatar: "https://picsum.photos/seed/avatar/400/400",
    promptId: id,
    slides: [emptySlide()],
  };
}

export default function DevCharactersPage() {
  const { config, setConfig, saveToServer, seedDefaultsToServer, hasDbRows } = useFriendConfig();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [slidesJson, setSlidesJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [adminSecret, setAdminSecret] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (s) setAdminSecret(s);
    } catch {
      /* ignore */
    }
  }, []);

  const storeSecret = (value: string) => {
    setAdminSecret(value);
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, value);
    } catch {
      /* ignore */
    }
  };

  const selected = useMemo(
    () => config.friends.find((f) => f.id === selectedId) ?? null,
    [config.friends, selectedId],
  );

  useEffect(() => {
    if (!selectedId && config.friends[0]) setSelectedId(config.friends[0].id);
  }, [config.friends, selectedId]);

  useEffect(() => {
    if (selected) {
      try {
        setSlidesJson(JSON.stringify(selected.slides, null, 2));
        setJsonError(null);
      } catch {
        setSlidesJson("[]");
      }
    }
  }, [selected]);

  const patchFriend = useCallback(
    (id: string, patch: Partial<FriendProfile>) => {
      setConfig({
        ...config,
        friends: config.friends.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      });
    },
    [config, setConfig],
  );

  const patchWelcome = useCallback(
    (friendId: string, text: string) => {
      setConfig({
        ...config,
        welcomeById: { ...config.welcomeById, [friendId]: text },
      });
    },
    [config, setConfig],
  );

  const patchPrompts = useCallback(
    (promptId: string, field: "system" | "hintStyle", value: string) => {
      const cur = config.promptsByPromptId[promptId] ?? { system: "", hintStyle: "" };
      setConfig({
        ...config,
        promptsByPromptId: {
          ...config.promptsByPromptId,
          [promptId]: { ...cur, [field]: value },
        },
      });
    },
    [config, setConfig],
  );

  const applySlidesJson = useCallback(() => {
    if (!selectedId) return;
    try {
      const parsed = JSON.parse(slidesJson) as unknown;
      if (!Array.isArray(parsed)) throw new Error("slides must be an array");
      patchFriend(selectedId, { slides: parsed as FriendSlide[] });
      setJsonError(null);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [selectedId, slidesJson, patchFriend]);

  const addFriend = () => {
    const f = newFriend();
    setConfig({
      ...config,
      friends: [...config.friends, f],
      welcomeById: { ...config.welcomeById, [f.id]: "첫 인사를 입력하세요." },
      promptsByPromptId: {
        ...config.promptsByPromptId,
        [f.promptId]: {
          system: "You are a helpful Korean chat friend.",
          hintStyle:
            'Return JSON only: {"suggestions":["...","..."]} with two short reply options for the user.',
        },
      },
    });
    setSelectedId(f.id);
  };

  const removeFriend = (id: string) => {
    if (!confirm(`Remove ${id}?`)) return;
    const victim = config.friends.find((f) => f.id === id);
    if (!victim) return;
    const nextFriends = config.friends.filter((f) => f.id !== id);
    const restWelcome = { ...config.welcomeById };
    delete restWelcome[id];
    const restPrompts = { ...config.promptsByPromptId };
    delete restPrompts[victim.promptId];
    setConfig({
      ...config,
      friends: nextFriends,
      welcomeById: restWelcome,
      promptsByPromptId: restPrompts,
    });
    setSelectedId(nextFriends[0]?.id ?? null);
  };

  const exportFile = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kchat-friend-config.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importFile = (file: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const p = JSON.parse(String(r.result)) as typeof config;
        if (!p.friends || !Array.isArray(p.friends)) throw new Error("invalid file");
        setConfig({
          friends: p.friends,
          welcomeById: p.welcomeById ?? {},
          promptsByPromptId: p.promptsByPromptId ?? {},
        });
        setSelectedId(p.friends[0]?.id ?? null);
      } catch {
        alert("JSON 파싱 실패");
      }
    };
    r.readAsText(file);
  };

  const welcome = selected ? config.welcomeById[selected.id] ?? "" : "";
  const prompts = selected
    ? config.promptsByPromptId[selected.promptId] ?? { system: "", hintStyle: "" }
    : { system: "", hintStyle: "" };

  return (
    <div className="min-h-dvh bg-zinc-100 text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold">캐릭터 편집 (Supabase)</h1>
            <p className="text-xs text-zinc-500">
              저장 시 모든 사용자에게 반영됩니다. Vercel에{" "}
              <code className="rounded bg-zinc-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code>,{" "}
              <code className="rounded bg-zinc-100 px-1">CHARACTER_ADMIN_SECRET</code> 필요.
              {!hasDbRows ? (
                <span className="ml-1 font-medium text-amber-700">
                  DB에 캐릭터 없음 → 아래에서 시드하거나 저장하세요.
                </span>
              ) : null}
            </p>
            {statusMsg ? (
              <p className="mt-1 text-xs text-emerald-700" role="status">
                {statusMsg}
              </p>
            ) : null}
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/friends" className="rounded-lg bg-zinc-900 px-3 py-1.5 text-white">
              앱으로
            </Link>
            <Link href="/dev/characters" className="text-zinc-600 underline">
              새로고침
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-3 p-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <label className="block text-sm font-medium text-zinc-700">관리자 비밀번호 (CHARACTER_ADMIN_SECRET)</label>
          <input
            type="password"
            autoComplete="off"
            className="mt-1 w-full max-w-md rounded-lg border border-zinc-200 px-3 py-2 font-mono text-sm"
            placeholder="환경 변수와 동일한 값"
            value={adminSecret}
            onChange={(e) => storeSecret(e.target.value)}
          />
        </div>

        <div className="mx-auto grid gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
          <button
            type="button"
            onClick={() => {
              void (async () => {
                setStatusMsg(null);
                try {
                  await saveToServer(adminSecret.trim(), config);
                  setStatusMsg("서버에 저장되었습니다.");
                } catch (e) {
                  setStatusMsg(e instanceof Error ? e.message : "저장 실패");
                }
              })();
            }}
            className="w-full rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white"
          >
            서버에 저장 (전체 반영)
          </button>
          <button
            type="button"
            onClick={() => {
              void (async () => {
                setStatusMsg(null);
                try {
                  await seedDefaultsToServer(adminSecret.trim());
                  setStatusMsg("기본 캐릭터(Noah/Yoon)를 DB에 넣었습니다.");
                } catch (e) {
                  setStatusMsg(e instanceof Error ? e.message : "시드 실패");
                }
              })();
            }}
            className="w-full rounded-lg border border-amber-200 bg-amber-50 py-2 text-sm font-medium text-amber-950"
          >
            DB에 기본 캐릭터 시드
          </button>
          <button
            type="button"
            onClick={addFriend}
            className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white"
          >
            + 캐릭터 추가
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("편집 중인 내용만 코드 기본값(Noah/Yoon)으로 되돌립니다. 서버에는 반영되지 않습니다.")) {
                setConfig(getDefaultFriendConfig());
              }
            }}
            className="w-full rounded-lg border border-zinc-200 py-2 text-sm"
          >
            편집만 초기화 (미저장)
          </button>
          <button type="button" onClick={exportFile} className="w-full rounded-lg border border-zinc-200 py-2 text-sm">
            JSON 내보내기
          </button>
          <label className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-300 py-2 text-sm">
            JSON 가져오기
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importFile(f);
                e.target.value = "";
              }}
            />
          </label>
          <ul className="max-h-[50vh] space-y-1 overflow-y-auto pt-2">
            {config.friends.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(f.id)}
                  className={`w-full rounded-lg px-2 py-2 text-left text-sm ${
                    selectedId === f.id ? "bg-zinc-900 text-white" : "bg-zinc-50 hover:bg-zinc-100"
                  }`}
                >
                  <div className="font-medium">{f.name}</div>
                  <div className="truncate text-xs opacity-80">{f.id}</div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {selected ? (
          <main className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="min-w-0 flex-1 text-base font-semibold">{selected.name}</h2>
              <Link
                href={`/friends/${selected.id}`}
                target="_blank"
                className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium"
              >
                릴스 열기
              </Link>
              <Link
                href={`/chat/${selected.id}`}
                target="_blank"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white"
              >
                채팅 테스트
              </Link>
              <button
                type="button"
                onClick={() => removeFriend(selected.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700"
              >
                삭제
              </button>
            </div>

            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-zinc-700">프로필</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-zinc-500">id (URL에 쓰임)</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                    value={selected.id}
                    readOnly
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-zinc-500">promptId (프롬프트 키)</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                    value={selected.promptId}
                    onChange={(e) => patchFriend(selected.id, { promptId: e.target.value.trim() })}
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="text-zinc-500">이름</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                    value={selected.name}
                    onChange={(e) => patchFriend(selected.id, { name: e.target.value })}
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="text-zinc-500">태그라인</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                    value={selected.tagline}
                    onChange={(e) => patchFriend(selected.id, { tagline: e.target.value })}
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="text-zinc-500">아바타 URL (이미지)</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                    value={selected.avatar}
                    onChange={(e) => patchFriend(selected.id, { avatar: e.target.value })}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-zinc-700">슬라이드 / 동영상 (JSON)</h3>
              <p className="mb-2 text-xs text-zinc-500">
                각 항목: src, alt, caption, baseLikes. 동영상은 src가 .mp4/.webm/.ogg 이거나 media: &quot;video&quot;
              </p>
              <textarea
                className="min-h-[200px] w-full rounded-lg border border-zinc-200 p-3 font-mono text-xs"
                value={slidesJson}
                onChange={(e) => setSlidesJson(e.target.value)}
              />
              {jsonError ? <p className="mt-1 text-xs text-red-600">{jsonError}</p> : null}
              <button
                type="button"
                onClick={applySlidesJson}
                className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
              >
                슬라이드 JSON 적용
              </button>
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-zinc-700">첫 인사 (빈 대화방에 한 번 저장)</h3>
              <textarea
                className="min-h-[100px] w-full rounded-lg border border-zinc-200 p-3 text-sm"
                value={welcome}
                onChange={(e) => patchWelcome(selected.id, e.target.value)}
                placeholder="채팅을 처음 열 때 assistant 첫 줄"
              />
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-zinc-700">시스템 프롬프트 (대화)</h3>
              <textarea
                className="min-h-[180px] w-full rounded-lg border border-zinc-200 p-3 font-mono text-xs"
                value={prompts.system}
                onChange={(e) => patchPrompts(selected.promptId, "system", e.target.value)}
              />
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-zinc-700">힌트 스타일 (Hint API)</h3>
              <textarea
                className="min-h-[120px] w-full rounded-lg border border-zinc-200 p-3 font-mono text-xs"
                value={prompts.hintStyle}
                onChange={(e) => patchPrompts(selected.promptId, "hintStyle", e.target.value)}
              />
            </section>
          </main>
        ) : (
          <p className="text-sm text-zinc-500">캐릭터를 선택하거나 추가하세요.</p>
        )}
        </div>
      </div>
    </div>
  );
}
