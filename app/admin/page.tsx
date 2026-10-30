"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [produtos, setProdutos] = useState<any[]>([]);

  // 🔹 Estados para edição
  const [editando, setEditando] = useState<any>(null);
  const [nomeEdit, setNomeEdit] = useState("");
  const [precoEdit, setPrecoEdit] = useState("");
  const [estoqueEdit, setEstoqueEdit] = useState(""); // vazio = sem controle
  const [categoriaEdit, setCategoriaEdit] = useState("");
  const [imagemEdit, setImagemEdit] = useState<File | null>(null);
  const [descricaoEdit, setDescricaoEdit] = useState("");
  const [homeEdit, setHomeEdit] = useState(false);           // 🔹 NOVO
  const [produtosEdit, setProdutosEdit] = useState(true);    // 🔹 NOVO

  // 🔹 Estados para criação
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoPreco, setNovoPreco] = useState("");
  const [novoEstoque, setNovoEstoque] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novaImagem, setNovaImagem] = useState<File | null>(null);
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoHome, setNovoHome] = useState(false);           // 🔹 NOVO
  const [novoProdutos, setNovoProdutos] = useState(false);    // 🔹 NOVO

  // 🔹 Exclusões ficam pendentes até clicar em "Salvar alterações"
  const [paraExcluir, setParaExcluir] = useState<number[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  // Sempre recarrega do banco: a tabela mostra o que está salvo de verdade
  const carregarProdutos = () =>
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProdutos(data));

  useEffect(() => {
    carregarProdutos();
  }, []);

  const alternarExclusao = (id: number) => {
    setAviso(null);
    setParaExcluir((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const salvarAlteracoes = async () => {
    setSalvando(true);
    const resultados = await Promise.all(
      paraExcluir.map(async (id) => {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        return { id, ok: res.ok, ...(await res.json().catch(() => ({}))) };
      })
    );
    await carregarProdutos();
    setSalvando(false);

    const falhas = resultados.filter((r) => !r.ok);
    const arquivados = resultados.filter((r) => r.ok && r.archived).length;
    setParaExcluir(falhas.map((r) => r.id)); // o que falhou continua pendente

    if (falhas.length) {
      setAviso({ tipo: "erro", texto: `Não foi possível excluir ${falhas.length} produto(s). Tente de novo.` });
    } else {
      setAviso({
        tipo: "ok",
        texto:
          `Alterações salvas: ${resultados.length} produto(s) excluído(s).` +
          (arquivados ? ` ${arquivados} já tinha(m) pedidos e foi(ram) arquivado(s): some(m) do site, mas continua(m) no histórico de pedidos.` : ""),
      });
    }
  };

  const iniciarEdicao = (produto: any) => {
    setEditando(produto);
    setNomeEdit(produto.name);
    setPrecoEdit(String(produto.price));
    setEstoqueEdit(produto.stock == null ? "" : String(produto.stock));
    setCategoriaEdit(produto.category || "");
    setDescricaoEdit(produto.description || "");            // 🔹 CORRIGIDO
    setHomeEdit(Boolean(produto.showOnHome));               // 🔹 NOVO
    setProdutosEdit(Boolean(produto.showOnProducts));       // 🔹 NOVO
    setImagemEdit(null);
  };

  const salvarEdicao = async () => {
    const formData = new FormData();
    formData.append("name", nomeEdit);
    formData.append("price", precoEdit);
    formData.append("stock", estoqueEdit);
    formData.append("category", categoriaEdit);
    formData.append("description", descricaoEdit);
    formData.append("showOnHome", String(homeEdit));            // 🔹 NOVO
    formData.append("showOnProducts", String(produtosEdit));    // 🔹 NOVO
    if (imagemEdit) formData.append("image", imagemEdit);

    const res = await fetch(`/api/products/${editando.id}`, {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) {
      setAviso({ tipo: "erro", texto: "Não foi possível salvar a edição. Nada foi alterado." });
      setEditando(null);
      return;
    }
    const produtoAtualizado = await res.json();

    setProdutos(produtos.map((p) => (p.id === editando.id ? produtoAtualizado : p)));
    setAviso({ tipo: "ok", texto: `"${produtoAtualizado.name}" salvo.` });
    setEditando(null);
  };

  const criarProduto = async () => {
    const formData = new FormData();
    formData.append("name", novoNome);
    formData.append("price", novoPreco);
    formData.append("stock", novoEstoque);
    formData.append("category", novaCategoria);
    formData.append("description", novaDescricao);
    formData.append("showOnHome", String(novoHome));            // 🔹 NOVO
    formData.append("showOnProducts", String(novoProdutos));    // 🔹 NOVO
    if (novaImagem) formData.append("image", novaImagem);

    const res = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      setAviso({ tipo: "erro", texto: "Não foi possível criar o produto. Confira os campos." });
      return; // mantém o formulário aberto e preenchido
    }
    const produtoCriado = await res.json();
    setProdutos([...produtos, produtoCriado]);
    setAviso({ tipo: "ok", texto: `"${produtoCriado.name}" criado.` });
    setCriando(false);
    setNovoNome("");
    setNovoPreco("");
    setNovoEstoque("");
    setNovaCategoria("");
    setNovaImagem(null);
    setNovaDescricao("");
    setNovoHome(false);        // 🔹 NOVO
    setNovoProdutos(false);     // 🔹 NOVO
  };

  if (status === "loading") return <p>Carregando...</p>;

  // Em vez de redirecionar sem explicar, mostra o motivo na tela
  if (!session || session.user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Área do administrador</h1>
        {session ? (
          <p>
            Você está logado como <strong>{session.user.email}</strong>, que é uma conta de
            cliente. Saia e entre com o email de administrador.
          </p>
        ) : (
          <p>Você precisa entrar com a conta de administrador.</p>
        )}
        <button
          onClick={() => (session ? signOut({ callbackUrl: "/login?callbackUrl=/admin" }) : router.push("/login?callbackUrl=/admin"))}
          className="bg-petroleo text-white hover:bg-petroleo-escuro px-4 py-2 rounded"
        >
          {session ? "Sair e entrar como admin" : "Entrar"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Painel Admin</h1>
      <p>Bem-vindo, {session.user.name}!</p>

      <button
        onClick={() => setCriando(true)}
        className="bg-petroleo text-white hover:bg-petroleo-escuro px-4 py-2 mt-4"
      >
        Novo Produto
      </button>

      <Link href="/admin/pedidos" className="ml-2 border px-4 py-2 mt-4 inline-block">
        Ver pedidos
      </Link>

      <Link href="/admin/metricas" className="ml-2 border px-4 py-2 mt-4 inline-block">
        Métricas
      </Link>

      {aviso && (
        <p
          className={`mt-4 p-3 rounded border text-sm ${
            aviso.tipo === "ok" ? "bg-green-50 border-green-300 text-green-800" : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          {aviso.tipo === "ok" ? "✅ " : "⚠️ "}
          {aviso.texto}
        </p>
      )}

      {/* 🔹 Barra de alterações pendentes */}
      {paraExcluir.length > 0 && (
        <div className="sticky top-0 z-10 mt-4 p-3 rounded border border-amber-300 bg-amber-50 flex flex-wrap items-center gap-3">
          <p className="text-sm text-amber-900 flex-1">
            {paraExcluir.length} produto(s) marcado(s) para excluir. Nada foi apagado ainda.
          </p>
          <button
            onClick={() => setParaExcluir([])}
            disabled={salvando}
            className="border border-gray-400 px-4 py-2 text-sm"
          >
            Descartar
          </button>
          <button
            onClick={salvarAlteracoes}
            disabled={salvando}
            className="bg-petroleo text-white hover:bg-petroleo-escuro px-4 py-2 text-sm disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      )}

      <table className="w-full border mt-6">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Nome</th>
            <th className="border p-2">Preço</th>
            <th className="border p-2">Estoque</th>
            <th className="border p-2">Categoria</th>
            <th className="border p-2">Imagem</th>
            <th className="border p-2">Home</th>       {/* 🔹 NOVO */}
            <th className="border p-2">Produtos</th>   {/* 🔹 NOVO */}
            <th className="border p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr
              key={p.id}
              className={paraExcluir.includes(p.id) ? "bg-red-50 line-through text-gray-400" : ""}
            >
              <td className="border p-2">{p.id}</td>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">R$ {p.price}</td>
              <td className="border p-2 text-center">
                {p.stock == null ? (
                  <span className="text-gray-400">sem controle</span>
                ) : p.stock === 0 ? (
                  <span className="text-red-600 font-semibold">Esgotado</span>
                ) : (
                  p.stock
                )}
              </td>
              <td className="border p-2">{p.category}</td>
              <td className="border p-2">
                {p.imageUrl && (
                  <Image src={p.imageUrl} alt={p.name} width={64} height={64} className="h-16 w-16 object-cover" />
                )}
              </td>
              <td className="border p-2 text-center">{p.showOnHome ? "✅" : "—"}</td>
              <td className="border p-2 text-center">{p.showOnProducts ? "✅" : "—"}</td>
              <td className="border p-2">
                <button
                  onClick={() => iniciarEdicao(p)}
                  className="bg-petroleo-claro text-white px-2 py-1 mr-2"
                >
                  Editar
                </button>
                {paraExcluir.includes(p.id) ? (
                  <button
                    onClick={() => alternarExclusao(p.id)}
                    className="border border-gray-400 text-gray-700 px-2 py-1 no-underline"
                  >
                    Desfazer
                  </button>
                ) : (
                  <button
                    onClick={() => alternarExclusao(p.id)}
                    className="bg-red-500 text-white px-2 py-1"
                  >
                    Excluir
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 Modal de edição */}
      {editando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col gap-3 w-full max-w-md">
            <h2 className="text-xl font-bold">Editar Produto</h2>
            <input
              type="text"
              placeholder="Nome"
              value={nomeEdit}
              onChange={(e) => setNomeEdit(e.target.value)}
              className="border p-2"
            />
            <input
              type="number"
              placeholder="Preço"
              value={precoEdit}
              onChange={(e) => setPrecoEdit(e.target.value)}
              className="border p-2"
            />
            <input
              type="number"
              min={0}
              placeholder="Estoque (vazio = sem controle)"
              value={estoqueEdit}
              onChange={(e) => setEstoqueEdit(e.target.value)}
              className="border p-2"
            />
            <select
              value={categoriaEdit}
              onChange={(e) => setCategoriaEdit(e.target.value)}
              className="border p-2"
            >
              <option value="">Selecione a categoria</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.label}>{c.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Descrição"
              value={descricaoEdit}
              onChange={(e) => setDescricaoEdit(e.target.value)}
              className="border p-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImagemEdit(file);
              }}
              className="border p-2"
            />

            {/* 🔹 NOVO: onde o produto aparece */}
            <div className="border rounded p-3 flex flex-col gap-2">
              <p className="font-semibold text-sm">Onde exibir este produto:</p>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={produtosEdit}
                  onChange={(e) => setProdutosEdit(e.target.checked)}
                />
                Página de Produtos
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={homeEdit}
                  onChange={(e) => setHomeEdit(e.target.checked)}
                />
                Home
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button onClick={salvarEdicao} className="bg-green-500 text-white px-4 py-2">
                Salvar
              </button>
              <button onClick={() => setEditando(null)} className="bg-gray-500 text-white px-4 py-2">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Modal de criação */}
      {criando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col gap-3 w-full max-w-md">
            <h2 className="text-xl font-bold">Adicionar Produto</h2>

            <input
              type="text"
              placeholder="Nome"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className="border p-2"
            />
            <input
              type="number"
              placeholder="Preço"
              value={novoPreco}
              onChange={(e) => setNovoPreco(e.target.value)}
              className="border p-2"
            />
            <input
              type="number"
              min={0}
              placeholder="Estoque (vazio = sem controle)"
              value={novoEstoque}
              onChange={(e) => setNovoEstoque(e.target.value)}
              className="border p-2"
            />
            <select
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              className="border p-2"
            >
              <option value="">Selecione a categoria</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.label}>{c.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Descrição"
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              className="border p-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setNovaImagem(file);
              }}
              className="border p-2"
            />

            {/* 🔹 NOVO: onde o produto aparece */}
            <div className="border rounded p-3 flex flex-col gap-2">
              <p className="font-semibold text-sm">Onde exibir este produto:</p>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={novoProdutos}
                  onChange={(e) => setNovoProdutos(e.target.checked)}
                />
                Página de Produtos
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={novoHome}
                  onChange={(e) => setNovoHome(e.target.checked)}
                />
                Home
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button onClick={criarProduto} className="bg-green-500 text-white px-4 py-2">
                Salvar
              </button>
              <button onClick={() => setCriando(false)} className="bg-gray-500 text-white px-4 py-2">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}