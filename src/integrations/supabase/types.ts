export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          acoes_iniciais: string[] | null
          ano_letivo: number
          atencao: string
          bimestre: number
          comportamento: string
          conceito_geral: string
          created_at: string | null
          date: string
          dificuldade_percebida: boolean
          escrita: string
          estrategia_em_sala: string | null
          frequencia_por_area: Json | null
          id: string
          leitura: string
          matematica: string
          observacao_professor: string | null
          outra_acao: string | null
          outros_sintomas: string | null
          principal_dificuldade: string | null
          recorrente_ou_recente: string | null
          sintomas_identificados: string[] | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          acoes_iniciais?: string[] | null
          ano_letivo: number
          atencao: string
          bimestre: number
          comportamento: string
          conceito_geral: string
          created_at?: string | null
          date: string
          dificuldade_percebida?: boolean
          escrita: string
          estrategia_em_sala?: string | null
          frequencia_por_area?: Json | null
          id?: string
          leitura: string
          matematica: string
          observacao_professor?: string | null
          outra_acao?: string | null
          outros_sintomas?: string | null
          principal_dificuldade?: string | null
          recorrente_ou_recente?: string | null
          sintomas_identificados?: string[] | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          acoes_iniciais?: string[] | null
          ano_letivo?: number
          atencao?: string
          bimestre?: number
          comportamento?: string
          conceito_geral?: string
          created_at?: string | null
          date?: string
          dificuldade_percebida?: boolean
          escrita?: string
          estrategia_em_sala?: string | null
          frequencia_por_area?: Json | null
          id?: string
          leitura?: string
          matematica?: string
          observacao_professor?: string | null
          outra_acao?: string | null
          outros_sintomas?: string | null
          principal_dificuldade?: string | null
          recorrente_ou_recente?: string | null
          sintomas_identificados?: string[] | null
          student_id?: string
          updated_at?: string | null
        }
      }
      critical_occurrence_logs: {
        Row: {
          author: string
          created_at: string | null
          id: string
          occurrence_id: string
          text: string
          time: string
        }
        Insert: {
          author: string
          created_at?: string | null
          id?: string
          occurrence_id: string
          text: string
          time: string
        }
        Update: {
          author?: string
          created_at?: string | null
          id?: string
          occurrence_id?: string
          text?: string
          time?: string
        }
      }
      critical_occurrences: {
        Row: {
          categories: string[]
          created_at: string | null
          description: string
          id: string
          reported_at: string | null
          reported_by: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["critical_occurrence_status"]
          student_id: string
          updated_at: string | null
        }
        Insert: {
          categories?: string[]
          created_at?: string | null
          description: string
          id?: string
          reported_at?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["critical_occurrence_status"]
          student_id: string
          updated_at?: string | null
        }
        Update: {
          categories?: string[]
          created_at?: string | null
          description?: string
          id?: string
          reported_at?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["critical_occurrence_status"]
          student_id?: string
          updated_at?: string | null
        }
      }
      family_contacts: {
        Row: {
          created_at: string | null
          houve_retorno: boolean | null
          id: string
          observacao: string | null
          student_id: string
          tentativa1: Json
          tentativa2: Json
          tentativa3: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          houve_retorno?: boolean | null
          id?: string
          observacao?: string | null
          student_id: string
          tentativa1?: Json
          tentativa2?: Json
          tentativa3?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          houve_retorno?: boolean | null
          id?: string
          observacao?: string | null
          student_id?: string
          tentativa1?: Json
          tentativa2?: Json
          tentativa3?: Json
          updated_at?: string | null
        }
      }
      intervention_updates: {
        Row: {
          author: string
          content: string
          created_at: string | null
          date: string
          id: string
          intervention_id: string
          time: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string | null
          date: string
          id?: string
          intervention_id: string
          time: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string | null
          date?: string
          id?: string
          intervention_id?: string
          time?: string
        }
      }
      interventions: {
        Row: {
          accepted_by: string | null
          action_category: Database["public"]["Enums"]["action_category"]
          action_tool: string
          created_at: string | null
          date: string
          id: string
          objetivo: string
          pending_until: string | null
          resolution_ata: string | null
          responsavel: string
          status: Database["public"]["Enums"]["intervention_status"]
          student_id: string
          updated_at: string | null
        }
        Insert: {
          accepted_by?: string | null
          action_category: Database["public"]["Enums"]["action_category"]
          action_tool: string
          created_at?: string | null
          date: string
          id?: string
          objetivo: string
          pending_until?: string | null
          resolution_ata?: string | null
          responsavel: string
          status?: Database["public"]["Enums"]["intervention_status"]
          student_id: string
          updated_at?: string | null
        }
        Update: {
          accepted_by?: string | null
          action_category?: Database["public"]["Enums"]["action_category"]
          action_tool?: string
          created_at?: string | null
          date?: string
          id?: string
          objetivo?: string
          pending_until?: string | null
          resolution_ata?: string | null
          responsavel?: string
          status?: Database["public"]["Enums"]["intervention_status"]
          student_id?: string
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
      }
      psych_assessments: {
        Row: {
          areas_atencao_pei: string[] | null
          classificacao: string
          created_at: string | null
          date: string
          id: string
          necessita_acompanhamento: boolean
          observacao: string | null
          pei: Json | null
          possui_pei: string | null
          potencialidades: string | null
          prazo_pei: string | null
          queixa_descritiva: string | null
          recomenda_elaboracao_pei: boolean | null
          responsavel: string | null
          student_id: string
          sugestoes_pei: string | null
          tipo: Database["public"]["Enums"]["psych_assessment_tipo"]
          updated_at: string | null
          zdp: string | null
        }
        Insert: {
          areas_atencao_pei?: string[] | null
          classificacao: string
          created_at?: string | null
          date: string
          id?: string
          necessita_acompanhamento?: boolean
          observacao?: string | null
          pei?: Json | null
          possui_pei?: string | null
          potencialidades?: string | null
          prazo_pei?: string | null
          queixa_descritiva?: string | null
          recomenda_elaboracao_pei?: boolean | null
          responsavel?: string | null
          student_id: string
          sugestoes_pei?: string | null
          tipo: Database["public"]["Enums"]["psych_assessment_tipo"]
          updated_at?: string | null
          zdp?: string | null
        }
        Update: {
          areas_atencao_pei?: string[] | null
          classificacao?: string
          created_at?: string | null
          date?: string
          id?: string
          necessita_acompanhamento?: boolean
          observacao?: string | null
          pei?: Json | null
          possui_pei?: string | null
          potencialidades?: string | null
          prazo_pei?: string | null
          queixa_descritiva?: string | null
          recomenda_elaboracao_pei?: boolean | null
          responsavel?: string | null
          student_id?: string
          sugestoes_pei?: string | null
          tipo?: Database["public"]["Enums"]["psych_assessment_tipo"]
          updated_at?: string | null
          zdp?: string | null
        }
      }
      student_documents: {
        Row: {
          created_at: string | null
          date: string
          doc_category: Database["public"]["Enums"]["document_category"] | null
          id: string
          name: string
          responsavel: string
          student_id: string
          type: Database["public"]["Enums"]["document_type"]
          url: string
        }
        Insert: {
          created_at?: string | null
          date: string
          doc_category?: Database["public"]["Enums"]["document_category"] | null
          id?: string
          name: string
          responsavel: string
          student_id: string
          type: Database["public"]["Enums"]["document_type"]
          url: string
        }
        Update: {
          created_at?: string | null
          date?: string
          doc_category?: Database["public"]["Enums"]["document_category"] | null
          id?: string
          name?: string
          responsavel?: string
          student_id?: string
          type?: Database["public"]["Enums"]["document_type"]
          url?: string
        }
      }
      students: {
        Row: {
          acompanhamento_externo: string | null
          created_at: string | null
          critical_alert: boolean | null
          id: string
          last_assessment_date: string | null
          matricula: string
          medicacao: string | null
          name: string
          pei: Json | null
          pei_recomendado: Json | null
          potencialidades: string | null
          psych_referral: boolean
          psych_referral_reason: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          turma_id: string
          updated_at: string | null
          zdp: string | null
        }
        Insert: {
          acompanhamento_externo?: string | null
          created_at?: string | null
          critical_alert?: boolean | null
          id?: string
          last_assessment_date?: string | null
          matricula: string
          medicacao?: string | null
          name: string
          pei?: Json | null
          pei_recomendado?: Json | null
          potencialidades?: string | null
          psych_referral?: boolean
          psych_referral_reason?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
          turma_id: string
          updated_at?: string | null
          zdp?: string | null
        }
        Update: {
          acompanhamento_externo?: string | null
          created_at?: string | null
          critical_alert?: boolean | null
          id?: string
          last_assessment_date?: string | null
          matricula?: string
          medicacao?: string | null
          name?: string
          pei?: Json | null
          pei_recomendado?: Json | null
          potencialidades?: string | null
          psych_referral?: boolean
          psych_referral_reason?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
          turma_id?: string
          updated_at?: string | null
          zdp?: string | null
        }
      }
      timeline_events: {
        Row: {
          created_at: string | null
          date: string
          description: string
          id: string
          student_id: string
          type: Database["public"]["Enums"]["timeline_event_type"]
        }
        Insert: {
          created_at?: string | null
          date: string
          description: string
          id?: string
          student_id: string
          type: Database["public"]["Enums"]["timeline_event_type"]
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          student_id?: string
          type?: Database["public"]["Enums"]["timeline_event_type"]
        }
      }
      turmas: {
        Row: {
          created_at: string | null
          id: string
          name: string
          professor_id: string | null
          turno: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          professor_id?: string | null
          turno: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          professor_id?: string | null
          turno?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      action_category:
        | "Ações Internas"
        | "Acionar Família"
        | "Acionar Psicologia"
        | "Acionar Psicopedagogia"
        | "Equipe Multidisciplinar"
      critical_occurrence_status: "Em Tratativa" | "Resolvido"
      document_category: "laudo" | "pei" | "outro"
      document_type: "pdf" | "image" | "doc"
      intervention_status: "Aguardando" | "Em_Acompanhamento" | "Concluído"
      psych_assessment_tipo: "Inicial" | "Reavaliação" | "Acompanhamento"
      risk_level: "low" | "medium" | "high"
      timeline_event_type:
        | "assessment"
        | "psych"
        | "intervention"
        | "referral"
        | "family_contact"
        | "potencialidades_registradas"
        | "pei_atualizado"
      user_role:
        | "professor"
        | "psicologia"
        | "psicopedagogia"
        | "coordenacao"
        | "diretoria"
        | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      action_category: [
        "Ações Internas",
        "Acionar Família",
        "Acionar Psicologia",
        "Acionar Psicopedagogia",
        "Equipe Multidisciplinar",
      ],
      critical_occurrence_status: ["Em Tratativa", "Resolvido"],
      document_category: ["laudo", "pei", "outro"],
      document_type: ["pdf", "image", "doc"],
      intervention_status: ["Aguardando", "Em_Acompanhamento", "Concluído"],
      psych_assessment_tipo: ["Inicial", "Reavaliação", "Acompanhamento"],
      risk_level: ["low", "medium", "high"],
      timeline_event_type: [
        "assessment",
        "psych",
        "intervention",
        "referral",
        "family_contact",
        "potencialidades_registradas",
        "pei_atualizado",
      ],
      user_role: [
        "professor",
        "psicologia",
        "psicopedagogia",
        "coordenacao",
        "diretoria",
        "admin",
      ],
    },
  },
} as const
