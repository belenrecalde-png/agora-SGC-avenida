import { ReportCategoryPicker } from "@/components/home/report-category-picker";

export const metadata = {
  title: "Reportar una situación | Ágora",
};

export default function ReportarPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-avenida-black">¿Qué querés reportar?</h1>
        <p className="max-w-2xl text-sm text-muted">
          No hace falta que conozcas las siglas de ISO 9001. Elegí la opción que mejor describe lo
          que te pasó y nosotros nos encargamos de encuadrarlo.
        </p>
      </div>

      <ReportCategoryPicker />
    </div>
  );
}
