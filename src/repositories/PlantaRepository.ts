
import { Prisma } from "@prisma/client";
import prisma from "@database";

export const createPlanta = async (data: Prisma.PlantaCreateInput) => {
  return await prisma.planta.create({
    data,
  });
};

export const findAllPlantas = async (
  filters: Prisma.PlantaWhereInput = {},
) => {
  return await prisma.planta.findMany({
    where: filters,
  });
};

export const findPlantaById = async (id: number) => {
  return await prisma.planta.findUnique({
    where: { id },
  });
};

export const updatePlanta = async (
  id: number,
  data: Prisma.PlantaUpdateInput,
) => {
  return await prisma.planta.update({
    where: { id },
    data,
  });
};

export const deletePlanta = async (id: number) => {
  return await prisma.planta.delete({
    where: { id },
  });
};

export const sellPlanta = async (id: number, quantidade: number) => {
  return await prisma.$transaction(async (tx) => {
    const planta = await tx.planta.findUnique({
      where: { id },
    });

    if (!planta) {
      return { tipo: "nao_encontrada" as const };
    }

    if (planta.estoque < quantidade) {
      return {
        tipo: "estoque_insuficiente" as const,
        estoqueDisponivel: planta.estoque,
      };
    }

    const plantaAtualizada = await tx.planta.update({
      where: { id },
      data: {
        estoque: {
          decrement: quantidade,
        },
      },
    });

    return {
      tipo: "sucesso" as const,
      planta: plantaAtualizada,
    };
  });
};



export const getValorTotalEstoque = async () => {
  const plantas = await prisma.planta.findMany({
    select: {
      preco: true,
      estoque: true,
    },
  });

  const valorTotalEmCentavos = plantas.reduce(
    (total, planta) => total + planta.preco * planta.estoque,
    0,
  );

  const totalDeVasos = plantas.reduce(
    (total, planta) => total + planta.estoque,
    0,
  );

  return {
    valorTotalEmCentavos,
    totalDeVasos,
  };
};

