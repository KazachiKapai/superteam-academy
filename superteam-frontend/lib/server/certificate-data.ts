import "server-only";

import { cache } from "react";
import { getCertificateById } from "@/lib/server/certificate-service";

export const getCachedCertificate = cache((id: string) =>
  getCertificateById(id),
);
