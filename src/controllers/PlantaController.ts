
import { Request, Response } from "express";
import { Luminosidade } from "@prisma/client";
import * as PlantaRepository from "@repositories/PlantaRepository";

const isLuminosidade = (valor: unknown): valor is Luminosidade => {
  return (
    typeof valor === "string" &&
    Object.values(Luminosidade).includes(valor as Luminosidade)
  );
};

export const createPlanta = async (req: Request, res: Response) => {
  try {
    const {
      nome,
      especie,
      preco,
      estoque,
      luminosidade,
      petFriendly,
      regaACadaDias,
    } = req.body ?? {};

    if (
      typeof nome !== "string" || !nome.trim() ||
      typeof especie !== "string" || !especie.trim() ||
      !Number.isInteger(preco) || preco <= 0 ||
      !Number.isInteger(estoque) || estoque < 0 ||
      !isLuminosidade(luminosidade) ||
      typeof petFriendly !== "boolean" ||
      !Number.isInteger(regaACadaDias) || regaACadaDias <= 0
    ) {
      return res.status(400).json({
        message: "Dados inválidos. Verifique os campos da planta.",
      });
    }

    const planta = await PlantaRepository.createPlanta({
      nome: nome.trim(),
      especie: especie.trim(),
      preco,
      estoque,
      luminosidade,
      petFriendly,
      regaACadaDias,
    });

    return res.status(201).json(planta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao cadastrar planta.",
    });
  }
};

export const readAllPlantas = async (req: Request, res: Response) => {
  try {
    const filters: {
      luminosidade?: Luminosidade;
      petFriendly?: boolean;
    } = {};

    const { luminosidade, petFriendly } = req.query;

    if (luminosidade !== undefined) {
      if (!isLuminosidade(luminosidade)) {
        return res.status(400).json({
          message: "Luminosidade inválida.",
        });
      }

      filters.luminosidade = luminosidade;
    }

    if (petFriendly !== undefined) {
      if (petFriendly !== "true" && petFriendly !== "false") {
        return res.status(400).json({
          message: "petFriendly deve ser true ou false.",
        });
      }

      filters.petFriendly = petFriendly === "true";
    }

    const plantas = await PlantaRepository.findAllPlantas(filters);

    return res.status(200).json(plantas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao buscar plantas.",
    });
  }
};

export const readPlantaById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID inválido.",
      });
    }

    const planta = await PlantaRepository.findPlantaById(id);

    if (!planta) {
      return res.status(404).json({
        message: "Planta não encontrada.",
      });
    }

    return res.status(200).json(planta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao buscar planta.",
    });
  }
};

export const updatePlanta = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID inválido.",
      });
    }

    const plantaExistente = await PlantaRepository.findPlantaById(id);

    if (!plantaExistente) {
      return res.status(404).json({
        message: "Planta não encontrada.",
      });
    }

    const {
      nome,
      especie,
      preco,
      estoque,
      luminosidade,
      petFriendly,
      regaACadaDias,
    } = req.body ?? {};

    const data: {
      nome?: string;
      especie?: string;
      preco?: number;
      estoque?: number;
      luminosidade?: Luminosidade;
      petFriendly?: boolean;
      regaACadaDias?: number;
    } = {};

    if (nome !== undefined) {
      if (typeof nome !== "string" || !nome.trim()) {
        return res.status(400).json({
          message: "Nome inválido.",
        });
      }

      data.nome = nome.trim();
    }

    if (especie !== undefined) {
      if (typeof especie !== "string" || !especie.trim()) {
        return res.status(400).json({
          message: "Espécie inválida.",
        });
      }

      data.especie = especie.trim();
    }

    if (preco !== undefined) {
      if (!Number.isInteger(preco) || preco <= 0) {
        return res.status(400).json({
          message: "Preço inválido.",
        });
      }

      data.preco = preco;
    }

    if (estoque !== undefined) {
      if (!Number.isInteger(estoque) || estoque < 0) {
        return res.status(400).json({
          message: "Estoque inválido.",
        });
      }

      data.estoque = estoque;
    }

    if (luminosidade !== undefined) {
      if (!isLuminosidade(luminosidade)) {
        return res.status(400).json({
          message: "Luminosidade inválida.",
        });
      }

      data.luminosidade = luminosidade;
    }

    if (petFriendly !== undefined) {
      if (typeof petFriendly !== "boolean") {
        return res.status(400).json({
          message: "petFriendly inválido.",
        });
      }

      data.petFriendly = petFriendly;
    }

    if (regaACadaDias !== undefined) {
      if (!Number.isInteger(regaACadaDias) || regaACadaDias <= 0) {
        return res.status(400).json({
          message: "Intervalo de rega inválido.",
        });
      }

      data.regaACadaDias = regaACadaDias;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        message: "Envie pelo menos um campo válido para atualizar.",
      });
    }

    const plantaAtualizada = await PlantaRepository.updatePlanta(id, data);

    return res.status(200).json(plantaAtualizada);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao atualizar planta.",
    });
  }
};

export const deletePlanta = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID inválido.",
      });
    }

    const planta = await PlantaRepository.findPlantaById(id);

    if (!planta) {
      return res.status(404).json({
        message: "Planta não encontrada.",
      });
    }

    await PlantaRepository.deletePlanta(id);

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao excluir planta.",
    });
  }
};

export const sellPlanta = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { quantidade } = req.body ?? {};

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID inválido.",
      });
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return res.status(400).json({
        message: "A quantidade deve ser um inteiro maior que zero.",
      });
    }

    const resultado = await PlantaRepository.sellPlanta(id, quantidade);

    if (resultado.tipo === "nao_encontrada") {
      return res.status(404).json({
        message: "Planta não encontrada.",
      });
    }

    if (resultado.tipo === "estoque_insuficiente") {
      return res.status(400).json({
        message: "Estoque insuficiente.",
        estoqueDisponivel: resultado.estoqueDisponivel,
      });
    }

    return res.status(200).json(resultado.planta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao realizar venda.",
    });
  }
};

export const readValorTotalEstoque = async (
  req: Request,
  res: Response,
) => {
  try {
    const resultado = await PlantaRepository.getValorTotalEstoque();

    return res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao calcular o valor total do estoque.",
    });
  }
};
