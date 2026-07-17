"use client";

import { Reveal } from "@/components/Reveal";
import { Accordion, type AccordionItem } from "@/components/site/Accordion";

export type CoreValuesBlockProps = {
  eyebrow: string;
  heading: string;
  tovWord: string;
  tovHebrew: string;
  bodyBefore: string;
  bodyTovWord: string;
  bodyAfter: string;
  values: AccordionItem[];
};

export function CoreValuesBlock({
  eyebrow,
  heading,
  tovWord,
  tovHebrew,
  bodyBefore,
  bodyTovWord,
  bodyAfter,
  values,
}: CoreValuesBlockProps) {
  return (
    <section className="border-t border-ink/10 bg-sand py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-32">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand">{eyebrow}</p>
            <h2 className="mt-6 font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
              {heading}{" "}
              <span className="text-brand">{tovWord}</span>
              <span className="ml-2 font-serif text-3xl font-normal italic text-ink/50">
                {tovHebrew}
              </span>
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-ink/70">
              {bodyBefore}
              <em className="font-serif not-italic text-ink">{bodyTovWord}</em>
              {bodyAfter}
            </p>
          </Reveal>

          <Reveal delay={140}>
            <Accordion items={values} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
