import Navbar from "@/components/Navbar";
import Footer from "./_components/footer";

export default function landLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>
)
{
    return (
        <div className="flex flex-col w-full h-auto">
            <Navbar/>
            <main>{children}</main>
            <Footer/>

        </div>
    )
}