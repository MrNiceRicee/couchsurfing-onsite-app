import BaseLayout from "~/layouts/BaseLayout";

export default function Home() {
  return (
    <BaseLayout
      head={{
        title: "Couch Surfing Onsite",
        description: "Couch Surfing technical onsite",
      }}
    >
      <div className="relative overflow-hidden py-2">
        <h1 className="text-5xl font-extrabold tracking-tight duration-500 ease-out animate-in fade-in slide-in-from-bottom sm:text-[5rem]">
          Couch Surfing Onsite
        </h1>
      </div>
    </BaseLayout>
  );
}
