import Image from "next/image";

type MethodStep = {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
};

export function MethodList(props: { method: MethodStep[] }) {
  return (
    <ol className="space-y-6">
      {props.method.map((step, index) => (
        <li key={index} className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
            {index + 1}
          </div>
          <div className="flex-1 pt-1 space-y-3">
            <div className="space-y-1">
              <p className="font-medium text-foreground">{step.title}</p>
              {step.description && (
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
            {step.imageUrl && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                <Image
                  src={step.imageUrl}
                  alt={`Step ${index + 1}: ${step.title}`}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
