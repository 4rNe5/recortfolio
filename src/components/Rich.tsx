import { Fragment } from "react";

/** "**굵게**"와 줄바꿈(\n)만 해석하는 아주 작은 마크업 */
export default function Rich({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : <Fragment key={j}>{part}</Fragment>,
          )}
        </Fragment>
      ))}
    </>
  );
}

/** 강조 표시를 떼어낸 평문 */
export const plain = (text: string) => text.replace(/\*\*/g, "");
