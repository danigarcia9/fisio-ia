"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { TherapyProposal as TherapyProposalType } from "@/lib/schemas/session";

interface TherapyProposalProps {
  proposal: TherapyProposalType;
}

export function TherapyProposal({ proposal }: TherapyProposalProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="text-lg">💊</span>
          Propuesta terapéutica
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Diagnóstico: <span className="text-foreground font-medium">{proposal.diagnosis}</span>
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Techniques */}
        <section>
          <h4 className="mb-2 text-sm font-semibold">Técnicas recomendadas</h4>
          <div className="flex flex-col gap-2">
            {proposal.techniques.map((technique, i) => (
              <div
                key={i}
                className="bg-muted/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{technique.name}</span>
                  <Badge
                    variant={technique.available ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {technique.available ? "Disponible" : "No disponible"}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {technique.description}
                </p>
                {!technique.available && technique.alternative && (
                  <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                    Alternativa: {technique.alternative}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Dry needling */}
        {proposal.dryNeedling && (
          <>
            <Separator />
            <section>
              <h4 className="mb-2 text-sm font-semibold">
                Protocolo de punción seca
              </h4>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Músculo:</span>{" "}
                    {proposal.dryNeedling.muscle}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Técnica:</span>{" "}
                    {proposal.dryNeedling.technique}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Posición:</span>{" "}
                    {proposal.dryNeedling.patientPosition}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aguja:</span>{" "}
                    {proposal.dryNeedling.needleSize}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Profundidad:</span>{" "}
                    {proposal.dryNeedling.depth}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ángulo:</span>{" "}
                    {proposal.dryNeedling.angle}
                  </div>
                </div>
                {proposal.dryNeedling.precautions.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                      Precauciones:
                    </span>
                    <ul className="text-muted-foreground mt-1 list-inside list-disc text-xs">
                      {proposal.dryNeedling.precautions.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Exercises */}
        {proposal.exercises.length > 0 && (
          <>
            <Separator />
            <section>
              <h4 className="mb-2 text-sm font-semibold">
                Ejercicios terapéuticos
              </h4>
              <div className="flex flex-col gap-2">
                {proposal.exercises.map((exercise, i) => (
                  <div
                    key={i}
                    className="bg-muted/50 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {exercise.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {exercise.sets}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {exercise.description}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Frecuencia: {exercise.frequency}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <Separator />

        {/* Follow-up info */}
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <h4 className="mb-1 text-sm font-semibold">Frecuencia de sesiones</h4>
            <p className="text-muted-foreground text-xs">
              {proposal.sessionFrequency}
            </p>
          </div>
          <div>
            <h4 className="mb-1 text-sm font-semibold">Evolución esperada</h4>
            <p className="text-muted-foreground text-xs">
              {proposal.expectedEvolution}
            </p>
          </div>
        </section>

        {proposal.followUpSigns.length > 0 && (
          <section>
            <h4 className="mb-1 text-sm font-semibold">
              Señales de alerta en seguimiento
            </h4>
            <ul className="text-muted-foreground list-inside list-disc text-xs">
              {proposal.followUpSigns.map((sign, i) => (
                <li key={i}>{sign}</li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
