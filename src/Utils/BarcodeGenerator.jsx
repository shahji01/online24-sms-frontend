import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

const BarcodeGenerator = ({ productNumber }) => {
    const barcodeRef = useRef(null);

    useEffect(() => {
        if (barcodeRef.current && productNumber) {
            JsBarcode(barcodeRef.current, productNumber.toString(), {
                format: "CODE128",
                lineColor: "#000",
                width: 2,
                height: 40,
                displayValue: true,
            });
        }
    }, [productNumber]);

    return <svg ref={barcodeRef} />;
};

export default BarcodeGenerator;
